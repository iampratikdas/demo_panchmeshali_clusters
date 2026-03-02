// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";

// import Autoplay from "embla-carousel-autoplay";

// const DashboardOverview = () => {
//   const images = [
//     { id: 1, src: "image_backgrpund.png", alt: "Image 1" ,styl: {backgroundColor: "beige"}},
//     { id: 1, src: "image23back.jpg", alt: "Image 1" ,styl: {backgroundColor: "beige"}},
//     // { id: 2, src: "pexels-pixabay-33109.jpg", alt: "Image 2" },
//     // { id: 3, src: "pexels-pixabay-33109.jpg", alt: "Image 3" },
//   ];

//   return (
//     <>
//       <Carousel
//         className="rounded-[12px_3px_22px_4px]"
//         plugins={[
//           Autoplay({
//             delay: 4000,
//           }),
//         ]}
//         style={{boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px"}}
//       >
//         <CarouselContent>
//           {images.map((image) => (
//             <CarouselItem
//               key={image.id}
//               className="md:basis-1/2 lg:basis-[100%] "

//             >
//               <img
//                 src={image.src}
//                 className="w-full h-[20rem] object-contain rounded-[12px_3px_22px_4px]"
//                 style={image.styl}
//                 // src={`@/assets/${image.src}`}
//                 alt={image.alt}
//                 // className="w-full h-auto object-cover"
//               />
//             </CarouselItem>
//           ))}
//         </CarouselContent>
//         <CarouselPrevious />
//         <CarouselNext />
//       </Carousel>
//     </>
//   );
// };
const DashboardOverview = () => {
  return (
    
    // <div className="relative rounded-xl overflow-hidden shadow-lg flex flex-col justify-end lg:min-h-[350px] md:min-h-[350px] sm:min-h-[350px]">
    //   <img
    //     src="image_backgrpund.jpg"
    //     alt="Dashboard background"
    //     className="absolute inset-0 w-full h-full object-cover"
    //   />
    // </div>
   <div
  className="relative rounded-xl overflow-hidden shadow-lg flex flex-col justify-end bg-cover bg-center min-h-[380px] bg-[url('/image_b_sm.jpg')] lg:bg-[url('/image_backgrpund.jpg')]"
>
  {/* Your content here */}
</div>




  );
};
export default DashboardOverview;