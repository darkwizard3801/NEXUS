import React from 'react'





import RecomendedProduct from '../components/RecomendedProduct';



const RecomendedEvents = () => {
  return (
    <div>

      <RecomendedProduct category={"catering"} heading={"Top Caters"}/>
      <RecomendedProduct category={"event-management"} heading={"Popular event managements"}/>
      <RecomendedProduct category={"rent"} heading={"Rent Items"}/>
      <RecomendedProduct category={"bakers"} heading={"Bakes & Deserts"}/>
      <RecomendedProduct category={"auditorium"} heading={"Auditorium"}/>
      <RecomendedProduct category={"audio-visual-it"} heading={"Audio-Visual-IT Teams"}/>
      <RecomendedProduct category={"photo-video"} heading={"Photography & Videography"}/>
      <RecomendedProduct category={"socia-media"} heading={"Social-Media Teams"}/>
      <RecomendedProduct category={"logistics"} heading={"Logistics"}/>
      <RecomendedProduct category={"decorations"} heading={"Decorations"}/>
    </div>
    

  )
}
export default RecomendedEvents;