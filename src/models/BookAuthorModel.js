import ApiRequest from "utils/ApiRequest"

export default class BookAuthor {
  static create = async (body) => {
    return await ApiRequest.set("v1/books-authors/create", "POST", body)
  }

  static delete = async (bookId, authorId) => {
    return await ApiRequest.set(`v1/books-authors/deletebyrelation/${bookId}/${authorId}`, "DELETE")
  }
}