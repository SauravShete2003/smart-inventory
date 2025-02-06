import Sales from "../models/Sales.js";
import Inventory from "./../models/Inventory.js";

const postSales = async (req, res) => {
  const { itemId, quantity, customer } = req.body;

  if (!itemId || !quantity) {
    return res
      .status(400)
      .json({ message: "Item ID and quantity are required" });
  }

  try {
    const item = await Inventory.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const totalPrice = item.price * quantity;

    const sale = new Sales({
      item: itemId,
      quantity,
      pricePerUnit: item.price,
      total: totalPrice,
      customer,
    });

    const savedSale = await sale.save();

    // Update the stock for the item
    item.stock -= quantity;
    await item.save();

    // Populate item and return sale details
    const populatedSale = await Sales.findById(savedSale._id).populate("item", "name price");

    return res
      .status(201)
      .json({ message: "Sale created successfully", sale: populatedSale });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Error creating sale", error: error.message });
  }
};
const getSales = async (req, res) => {
  try {
    const sales = await Sales.find().populate("item").exec();

    return res.status(200).json({ sales });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching sales", error: error.message });
  }
};

export { postSales, getSales };
