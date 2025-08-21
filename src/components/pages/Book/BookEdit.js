import { useState, useEffect } from "react"
import { useParams } from "react-router-dom";
import BookFormPage from "./BookFormPage";
import moment from "moment";
import Book from "models/BookModel";

const BookEdit = () => {
  const [bookData, setBookData] = useState({})

  const params = useParams();

  const getBookData = async (id) => {
    let result = await Book.getById(id);
    let categories = result.book_categories.map((bc) => {
      return {
        ...bc.categories
      }
    })
    let formattedResult = {
      ...result,
      categories,
    }
    return formattedResult;
  }

  useEffect(() => {
    (async () => {
      let result = await getBookData(params.id)
      setBookData(result)
    })()
  }, [params])

  return (
    <BookFormPage bookData={bookData}></BookFormPage>
  )
}

export default BookEdit