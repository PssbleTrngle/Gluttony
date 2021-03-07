/** @jsxImportSource @emotion/react */
import { FC } from "react"
import { useParams } from "react-router"
import { useApi } from "../api/hooks"

const Show: FC = () => {
   const params = useParams<{ id: string }>()
   const [show] = useApi(`show/${params.id}`)

   return <pre>{JSON.stringify(show, null, 2)}</pre>
}

export default Show