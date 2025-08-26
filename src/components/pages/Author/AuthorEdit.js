import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AuthorFormPage from "./AuthorFormPage"
import Author from "models/AuthorModel";

const AuthorEdit = () => {
  const [authorData, setAuthorData] = useState({})

  const params = useParams();

  const getAuthorData = async (id) => {
    return await Author.getById(id);
  }

  useEffect(() => {
    (async () => {
      let result = await getAuthorData(params.id)
      setAuthorData(result)
    })()
  }, [params])


  return (
    <AuthorFormPage authorData={authorData}></AuthorFormPage>
  )
}

export default AuthorEdit;