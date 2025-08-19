import { useState, useEffect } from "react"
import { useParams } from "react-router-dom";
import BookFormPage from "./BookFormPage";
import moment from "moment";

const BookEdit = () => {
  const [bookData, setBookData] = useState({
    title: "",
    title_en: "",
    description: "",
    description_en: "",
    publish_date: "",
    isbn: "",
  })

  const params = useParams();

  const getBookData = (id) => {
    return {
      id: 1,
      title: "a",
      image_cover: "https://youtooz.com/cdn/shop/products/sb_nailonheadpatrick_characterai_el_779x1000trim_min-46a6.png?v=1682023304"
    }
  }

  useEffect(() => {
    let result = getBookData(params.id)
    setBookData(result)
  }, [params])

  return (
    <BookFormPage bookData={bookData} ></BookFormPage>
  )
}

export default BookEdit