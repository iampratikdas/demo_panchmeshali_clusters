import React, { useEffect, useState, useCallback } from "react";
import { CardContent } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import { pageName } from "@/store/pageSlicer";
import { fetchProfile } from "@/auth/api";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusList from "@/components/common/StatusList";
import { useSelector } from 'react-redux';
import { setCurrentPageStatus, resetPage, clearReset , setCurrentTab } from '../store/currentPageSlicer';
interface Id {
  id?: string | undefined;
}



export default function StoryStatus() {
  const payload = {
  filter: {
    eid: {
      $eq: "",
    },
  },
  sortBy: {
    updatedAt: -1,
    _id: -1,
  },
  uid: localStorage.getItem("uid"),
  };
  
  const payloadev = {
  filter: {
    eid: {
      $ne: "",
    },
  },
  sortBy: {
    updatedAt: -1,
    _id: -1,
  },
  uid: localStorage.getItem("uid"),
  };
  const params = useParams();
  const id: Id = { id: params.id! };

  const [filterFields, setFilterFields] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("event_story");
  // Local state
  const [eventlists , setEventLists] = useState([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [searchTextInput, setSearchTextInput] = useState<string>("");
  const [searchTextDrop, setSearchTextDrop] = useState<string>("");
  const [status, setStatus] = useState<string>("updatedAt");

  //filter state
  const [payloadEvent , setPayloadEvent] = useState(payloadev)
  const [payloadPage , setPayloadPage] = useState(payload)
  const [applyFilter, setApplyFilter] = useState<string>({});
  const dispatch = useDispatch();
  const nav = useNavigate();

  useEffect(() => {
    dispatch(pageName("story-status"));
  }, [dispatch]);

 const { currentPageStatus, reset } = useSelector((state) => state.currentPageStatus);
  const fetchEvents = useCallback(async () => {
    const role = localStorage.getItem("role") || "";
    const res = await fetchProfile("/event_lists_users");
    const arrYFetch = res.data.map((items) => ({
      value: items.eid,
      label: items.name
    }));
    // setSearchText(arrYFetch[0].value)
    const fields = [
      {
        type: "select-dropdown" as const,
        label: "Search",
        options: [
          { value: "name", label: "Story Name" },
          ...(["admin", "manager"].includes(role)
            ? [{ value: "author_name", label: "Author Name" }]
            : []),
        ],
      },
      {
        type: "select" as const,
        label: "Event Lists",
        options: arrYFetch,
      }
      ,
      {
        type: "buttonGroup" as const,
        label: "Sort By",
        options: [
          { value: "totalMarks", label: "Total Marks" },
          { value: "updatedAt", label: "Sort  by Submission Time" },
        ],
      },
    ];
    setFilterFields(fields);

  }, []); 

   
  
  useEffect(() => {
    fetchEvents()

  }, [fetchEvents]);

  useEffect(()=>{
      if(isOpen){
        setIsOpen(!isOpen);
      }
      resetFunc();
      dispatch(setCurrentTab(activeTab))
    }, [activeTab])
  



 const resetFunc = () => {
    setSearchText("");
    setSearchTextInput("")
    setStatus("updatedAt");
    setSearchTextDrop("");
    setPayloadEvent(payloadev);
    setPayloadPage(payload);
     // console.log("searchvaloe==========>", searchText , searchTextInput)
    // setIncludeArchived(false);
  };

  const handleOPen = ()=>{
    setIsOpen(!isOpen);
  }

  const handleApply = () =>{
    let finalPayload = {
      filter: {
        eid: activeTab === "event_story" && searchText === ""? {
          $ne: "" ,
        }: activeTab === "event_story" && searchText != ""?{
          $eq: searchText ,
        } : {
          $eq: "" ,
        },
        ...(searchTextDrop 
          ? { [searchTextDrop]: {"$regex": `.*${searchTextInput}.*`, "$options": "i" }  }
          : {}),
      },
      sortBy: {
        [status]: -1,
        _id: -1,
      },
      uid: localStorage.getItem("uid"),
  };
  dispatch(setCurrentPageStatus(1));
  activeTab === "event_story" ? setPayloadEvent(finalPayload) : setPayloadPage(finalPayload)
  // resetFunc()
    console.log("finalPayload========>",searchTextDrop, "<===>", finalPayload)
    console.log("function=============> applyyyyy" ,searchText ,"searchTextInput======>",  searchTextInput ,"searchTextDrop======>", searchTextDrop  ,"status======>", status)
  }


 
  id.id = !["event_story", "page_story"].includes(id.id!)
    ? "event_story"
    : id.id;

    return (
    <React.Fragment>
      <ToastContainer position="bottom-center" />
      <CardContent>
        <Tabs defaultValue={id.id} value={activeTab} onValueChange={setActiveTab}  className="w-full">
          <TabsList className="w-full flex flex-col md:flex-row gap-2">
            <TabsTrigger
              value="event_story"
              className="text-[1rem] w-full"
            >
              Event Content Status
            </TabsTrigger>
            <TabsTrigger
              value="page_story"
              className="text-[1rem] w-full"
            >
              Page Content Status
            </TabsTrigger>
          </TabsList>

          {/* Event Story Tab */}
          <StatusList
            statusValue={"event_story"}
            statusDesc={"Status of your Event Contents"}
            cardTitleDesc={
              "Here you can see the status of your content (Status of your content will change from Pending to Approve or Reject after Editor's confirmation)"
            }
            payload={  payloadEvent}
            apply={handleApply}
            filterFields={[
              {
                ...filterFields[0],
                value: searchTextDrop,
                searchValue: searchTextInput,
                onChange: (v: string) => {
                  console.log("textSearch======>", v);
                  setSearchTextDrop(v)
                },
                onSearchChange: (v: string) => setSearchTextInput(v),
              },
              {
                ...filterFields[1],
                value: searchText,
                
                onChange: (v: string) => setSearchText(v),
                
              },
              
              {
                ...filterFields[2],
                value: status,
                onChange: (v: string) => setStatus(v),
              },
            ]}
            handleApply={handleApply}
            resetFunc={resetFunc}
            type={true}
            isOpen={isOpen}
            status={status}
            searchText={searchText}
            handleOPen={handleOPen}
            setSearchText={setSearchText}
            setStatus={setStatus}
             setSearchTextInput={setSearchTextInput}
            setSearchTextDrop={setSearchTextDrop}
            // applyFilter={applyFilter}
            // url= {`/list_contents?page=${1}&limit=${5}`}
          />

          {/* Page Story Tab */}
          <StatusList
            statusValue={"page_story"}
            statusDesc={"Status of your Page Contents"}
            cardTitleDesc={
              "Here you can see the status of your content (Status of your content will change from Pending to Approve or Reject after Editor's confirmation)"
            }
            payload={ payloadPage}
            filterFields={[
              {
                ...filterFields[0],
                value: searchTextDrop,
                searchValue: searchTextInput,
                onChange: (v: string) => setSearchTextDrop(v),
                onSearchChange: (v: string) => setSearchTextInput(v),
              },
              
              {
                ...filterFields[2],
                value: status,
                onChange: (v: string) => setStatus(v),
              },
            ]}
            handleApply={handleApply}
            resetFunc={resetFunc}
            type={false}
            isOpen={isOpen}
            status={status}
            searchText={searchText}
            handleOPen={handleOPen}
            setSearchText={setSearchText}
            setStatus={setStatus}
             setSearchTextInput={setSearchTextInput}
            setSearchTextDrop={setSearchTextDrop}
            // applyFilter={applyFilter}
          />
        </Tabs>
      </CardContent>
    </React.Fragment>
  );
}
