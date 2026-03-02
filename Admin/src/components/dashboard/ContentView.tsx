import { Card, CardContent } from "@/components/ui/card";
import React from "react";
// import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// import { ContentState } from '../../lib/type'
interface contentitems {
  contents: {
    id: String;
    h1: string;
    p: string;
    img: string;
  };
  id: String;
  parentId: string | null;
  type: String;
}
export function ContentView(content: contentitems) {
  const navigate = useNavigate();
  let contentList = content.contents
  console.log("cccc", content.contents)
  return (
    <React.Fragment>
      <Card className="max-w-[100%] sm:max-w-[100%] md:max-w-[49%]">

        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Image Section */}
            <div className="w-full md:w-1/2">
              <img
                src={contentList.img}
                alt="Sample"
                className="w-full h-[300px] object-cover rounded-lg"
              />
            </div>
            {/* Content Section */}
            <div className="w-full p-4 md:w-1/2">
              <h2 className="text-lg font-semibold mb-2">
                {contentList.h1}
              </h2>
              <p className="text-sm text-gray-600">
                This is a sample description for the visitors' section. You can
                add more details here about the content you want to display.
              </p>
              {/* <button onClick={()=> navigate(`/rules/${content.id}`)} className="mt-4 px-4 py-2 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition">
                Learn More
              </button> */}
              <button onClick={() => navigate(`/rules/${content.id}`)} className="mt-4 text-white bg-orange-600 font-semibold border-none hover:text-orange-600 hover:bg-gray-100 transition-colors duration-300">
                আরও জানতে→
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </React.Fragment>
  );
}
