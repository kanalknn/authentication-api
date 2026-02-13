const { customerDetail } = require("../controllers/admin/customer.controller");
const { create } = require("../models/customer.model");

module.exports = {
  //customers
  userExistsTryLogin: "Customer details already exist. Please try logging in.",
  userSuspended: "Customer account is suspended.",
  userDeleted: "Customer account has been deleted.",
  userNotExist: "Customer does not exist.",
  notRegistered: "Mobile number is not registered.",
  otpSent: "OTP sent successfully.",
  cannotSendOtp: "Unable to send OTP. Please try again later.",
  otpVerifiedSuccess: "OTP verified successfully.",
  invalidOtp: "Invalid OTP. Please try again.",
  success: "Request processed successfully.",
  customerAdded: "Customer details added successfully.",
  customerUpdated: "Customer details updated successfully.",
  customerDeleted: "Customer deleted successfully.",
  getCustomers: "Customers retrieved successfully.",

  //products
  createProducts: "Product details added successfully",
  ProductsExist: "Product details already exist",
  getProducts: "Products details get successfully",
  noProducts: "No other products found.",
  updateProducts: "Product details update successfully",
  ProductsDeleted: "Product deleted successfully.",
  typeRequired: "Type is required",
  noTypeProducts: "No product found for the given type",
  typeProducts: "Product of type fetched successfully",
  idRequired: "ID is required",
  idInvalid: "Invalid Category ID",
  categoryIdRequired: "Category ID is required",

  //
  getOrder: "Order details fetched successfully",
  getCustomerOrders: "Customer Order fetch successfully",
  updateOrder: "Order details update successfully",
  noOrder: "Order not exist",
  noOrdersFound: "No orders found",
  OrderDeleted: "Order deleted successfully.",

  invalidAddress: "Invalid address provided",
  paymentFalid: "PhonePe payment initiation failed",
  orderCreated: "Order created successfully",

  updateSuccess: "Record updated successfully",
  createSuccess: "Record created successfully",
  //
  passwordNotCorrect: "Password is not correct",

  //
  updateOrderAddressSuccess: "Order shipping address updated successfully",
  updateOrderAddressIncomplete: "Incomplete address details provided",
  orderNotFound: "Order not found",
  orderMissingID: "Order ID is required",
  updateOrderAddressError: "Error updating order shipping address",

  //
  notFound: "Record not found",
  deleteSuccess: "Record deleted successfully",

  //
  getSuccess: "Record fetched successfully",
  customerDetail: "Customer details fetched successfully",
  customerCreate: "Customer created successfully",
  customerNotFound: "Customer not found",
  addressNotFound: "Address not found",
  customerUpdate: "Customer updated successfully",

  //
  noFiles: "No files found",
  fileSuccess: "File uploaded successfully",

  //
  noUser: "User not found",
  adminLog: "Admin logged in successfully",
};
