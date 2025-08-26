import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PublisherFormPage from "./PublisherFormPage"
import Publisher from "models/PublisherModel";

const PublisherEdit = () => {
  const [publisherData, setPublisherData] = useState({})

  const params = useParams();

  const getPublisherData = async (id) => {
    return await Publisher.getById(id);
  }

  useEffect(() => {
    (async () => {
      let result = await getPublisherData(params.id)
      setPublisherData(result)
    })()
  }, [params])


  return (
    <PublisherFormPage publisherData={publisherData}></PublisherFormPage>
  )
}

export default PublisherEdit;