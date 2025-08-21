import ApiRequest from "../utils/ApiRequest"

export default class BookCategory {
  static getByBookId = async (id) => {
    return await ApiRequest.set(`v1/books-categories/books/${id}/categories`, "GET");
  }
  static getByCategoryId = async (id) => {
    return await ApiRequest.set(`v1/books-categories/categories/${id}/books`, "GET");
  }
  
  static create = async (body) => {
    return await ApiRequest.set('v1/books-categories/create-books-categories', "POST", body);
  }

  static delete = async (bookId, categoryId) => {
    return await ApiRequest.set(`v1/books-categories/${bookId}/${categoryId}`, "DELETE");
  }
}