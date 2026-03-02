import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchContents } from "@/store/contentSlicer";
import { fetchContentsTrailers } from "@/store/contentTrailerSlicer";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import useScrollerUp  from "../hooks/scrollup"
const RulesContent = () => {
    useScrollerUp(0)
    const navigate = useNavigate();
    const id: any = useParams()
    const dispatch = useDispatch<AppDispatch>();
    const content: any = useSelector((state: RootState) => state.contents.data);
    const isLoading_trailers = useSelector((state: RootState) => state.contents_trailers.isLoading);
    const contents_trailers = useSelector((state: RootState) => state.contents_trailers.data);
    const isLoading = useSelector((state: RootState) => state.contents.isLoading);
    // const [content, setContent] = useState<any>(null);
    useEffect(() => {

        if (id) {
            dispatch(fetchContents(id));
            dispatch(fetchContentsTrailers());
        }
    }, [id])
    // useEffect(() => {
    //     if (!isLoading && !isLoading_trailers) {
    //         setContent(contents)
    //     }
    // }, [])
    if (isLoading && isLoading_trailers) {
        return <>Loading</>
    }
    // console.log("content==========>", isLoading && isLoading_trailers, "contents_trailers===>", content , contents_trailers)
    return (
        <div className="text-white min-h-screen">

            {/* Hero Banner */}
            <div className="relative bg-cover bg-center h-[400px] flex items-center justify-start" style={{ backgroundImage: `url(${content.contents.img})` }}>
                <div className="bg-black/60 absolute inset-0 z-0" />
                <div className="z-10 px-8 md:px-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-orange-500">{content.contents.h1}</h1>
                    <p className="mt-4 max-w-3xl text-lg md:text-xl text-white">
                        {content.contents.h2}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white text-black py-12 px-6 md:px-24">
                <div className="mx-auto">
                    <h2 className="text-2xl font-semibold mb-6">বিস্তারিত নির্দেশিকা</h2>
                    <p className="leading-7 text-gray-800 whitespace-pre-line">{content.contents.p}</p>
                    <p className="leading-7 text-gray-800 whitespace-pre-line mt-4"><b>{content.contents.p1}</b></p>

                </div>
            </div>

            {/* {Artclie section} */}
            <div className="bg-gray-100 py-14 px-6 md:px-24">
                <div className="flex justify-between items-center mb-5">

                    <h2 className="text-2xl font-semibold mb-8 text-black mb-[unset]">লেখকের অন্যান্য রচনা</h2>
                    {/* {
                        contents_trailers.length > 2 && <a className="text-orange-600 font-semibold cursor-pointer">আরও পড়ুন →</a>
                    } */}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.isArray(contents_trailers) && contents_trailers.slice(0, 3).map((article, idx) => (
                        <div key={idx} className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 ">
                            <img src={article.contents.img} alt={article.contents.h1} className="w-full h-48 object-cover" />
                            <div className="p-5 flex flex-col justify-between h-[57%]">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{article.contents.h1}</h3>
                                    <p className="text-sm text-gray-700">{article.contents.p2}</p>
                                </div>
                                <div className="pb-4">

                                    <button onClick={() => navigate(`/rules/${article.contents.id}`)} className="mt-4 text-white bg-orange-600 font-semibold border-none hover:text-orange-600 hover:bg-gray-100 transition-colors duration-300">
                                        আরও পড়ুন →
                                    </button>


                                </div>
                            </div>
                            {/* <div className="p-5">
                            </div> */}

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RulesContent;
