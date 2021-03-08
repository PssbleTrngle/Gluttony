/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled"
import { FC, useMemo } from "react"
import { useParams } from "react-router"
import { useLoading } from "../api/hooks"
import { ISeason, IShowFull } from "../api/models"
import Season from "../components/Season"
import { Title as TitleBase } from "../components/Text"

const Show: FC = () => {
   const params = useParams<{ id: string }>()

   return useLoading<IShowFull>(`show/${params.id}`, show =>
      <Container>
         <Title>{show.name}</Title>
         <Poster src={show.image} alt={`Artwork for ${show.name}`} />
         <Status>{show.status.name}</Status>
         <Seasons seasons={show.seasons} />
      </Container>
   )
}

const Seasons: FC<{ seasons: ISeason[] }> = ({ seasons }) => {

   const visible = useMemo(() => {
      const type = seasons[0]?.name
      return seasons.filter(s => s.name === type)
   }, [seasons])

   return <ul css={{ gridArea: 'seasons' }}>
      {visible.map(s =>
         <Season key={s.id} {...s} />
      )}
   </ul>
}

const Title = styled.h1`
   ${TitleBase.__emotion_styles};
   letter-spacing: 0.5rem;
   font-size: 3rem;
`

const Poster = styled.img`
   grid-area: poster;
   width: 100%;
`

const Status = styled.span`
   grid-area: status;
`

const Container = styled.section`
   display: grid;
   grid-template:
      "name poster"
      "status poster"
      "seasons poster"
      ". poster"
      / 2fr 1fr;
`

export default Show