import React from 'react'



import CategoryList from '../components/CategoryList'
import BannerProduct from '../components/BannerProduct'
import HorizontalCardProduct from '../components/HorizontalCardProduct'
import VerticalCardProduct from '../components/VerticalCardProduct'



const Home2 = () => {
  return (
    <div>
<BannerProduct/>
<div  className='py-10'>

<CategoryList/>
</div>

<HorizontalCardProduct category={"catering"} heading={"Top's Caters"}/>
<HorizontalCardProduct category={"event-management"} heading={"Popular event managements"}/>


      <VerticalCardProduct category={"rent"} heading={"Rent Items"}/>
      <VerticalCardProduct category={"bakers"} heading={"Bakes & Deserts"}/>
      <VerticalCardProduct category={"auditorium"} heading={"Auditorium"}/>
      <VerticalCardProduct category={"audio-visual-it"} heading={"Audio-Visual-IT Teams"}/>
      <VerticalCardProduct category={"photo-video"} heading={"Photography & Videography"}/>
      <VerticalCardProduct category={"socia-media"} heading={"Social-Media Teams"}/>
      <VerticalCardProduct category={"logistics"} heading={"Logistics"}/>
      <VerticalCardProduct category={"decorations"} heading={"Decorations"}/>
    </div>
    

  )
}
export default Home2;