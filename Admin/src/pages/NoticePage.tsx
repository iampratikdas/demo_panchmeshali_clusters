import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React ,{useEffect , useState} from "react";
import {fetchProfile} from "../auth/api"
import {pageName} from "@/store/pageSlicer";
import { Hourglass } from 'react-loader-spinner';
import moment from "moment";
import { Sparkles } from "lucide-react";


export default function NoticePage() {
  const [list, setList] = useState([]);
  const [loading , setLoading] = useState(true)
  let now = moment();
  useEffect(() => {
    async function loadNotices() {
      try {
        setLoading(true);
        const res = await fetchProfile("/list_notice"); // API function
        setList(res.lists);
      } catch (err) {
        setLoading(false);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadNotices();
  }, []);

  // console.log("list==============>", list);
return (
  <React.Fragment>
    {loading && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Hourglass size={100} color="#fff" />
      </div>
    )}

    {list.length > 0 ? (
      <>
        {list.map((items) => {
          const updatedAt = moment.unix(items.updatedAt);
            const isNew = now.diff(updatedAt, "hours") < 48;
          return(
          <Card
            key={items.id || items.title} // provide a unique key
            className="relative w-full mb-2 shadow-md hover:shadow-lg transition-all duration-300 bg-white rounded-xl p-3 sm:p-4"
          >
             {isNew && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white text-xs sm:text-sm font-semibold px-2 py-1 rounded-full shadow-md">
                    <Sparkles size={14} className="text-yellow-300" />
                    NEW
                  </span>
                )}
            <CardHeader className="text-2xl">
              <CardTitle className="leading-snug">{items.title}</CardTitle>
            </CardHeader>
            <CardContent>{items.message}</CardContent>
          </Card>
        )

        
      }

    )
      }
      </>)
     : (
      <Card className="w-full max-w-7xl flex justify-center mx-auto max-sm:mb-20">
        No Notices Found!!!
      </Card>
    )}
  </React.Fragment>
);

}
