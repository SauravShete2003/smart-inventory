import Sales from '../models/Sales.js';
import Inventory from '../models/Inventory.js';

// Get all sales
export const getAllSales = async (req, res) => {
  try {
    const sales = await Sales.find()
      .populate('item', 'name price')
      .sort({ saleDate: -1 });
    
    res.json({ sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Error fetching sales data' });
  }
};

// Create new sale
export const createSale = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    // Find the item in inventory
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if enough stock is available
    if (item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Calculate total price
    const total = item.price * quantity;

    // Create new sale
    const sale = new Sales({
      item: itemId,
      quantity,
      pricePerUnit: item.price,
      total,
      saleDate: new Date()
    });

    await sale.save();

    // Update inventory quantity
    item.quantity -= quantity;
    await item.save();

    res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Error creating sale' });
  }
};

// Get sales statistics
export const getSalesStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    // Get total sales
    const totalSales = await Sales.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get monthly sales
    const monthlySales = await Sales.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get weekly sales
    const weeklySales = await Sales.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfWeek }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get top selling items
    const topSellingItems = await Sales.aggregate([
      {
        $group: {
          _id: '$item',
          totalQuantity: { $sum: '$quantity' },
          totalSales: { $sum: '$total' }
        }
      },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      {
        $project: {
          name: '$itemDetails.name',
          quantity: '$totalQuantity',
          total: '$totalSales'
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalSales: totalSales[0]?.total || 0,
      monthlySales: monthlySales[0]?.total || 0,
      weeklySales: weeklySales[0]?.total || 0,
      topSellingItems
    });
  } catch (error) {
    console.error('Error fetching sales statistics:', error);
    res.status(500).json({ message: 'Error fetching sales statistics' });
  }
}; 