import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NewsFormPage from "./NewsFormPage"
import News from "models/NewsModel";

const NewsEdit = () => {
  const [newsData, setNewsData] = useState({})

  const params = useParams();

  const getNewsData = async (id) => {
    return await News.getById(id);
  }

  useEffect(() => {
    (async () => {
      let result = await getNewsData(params.id)
      setNewsData(result)
    })()
  }, [params])


  return (
    <NewsFormPage newsData={newsData}></NewsFormPage>
  )
}

export default NewsEdit;