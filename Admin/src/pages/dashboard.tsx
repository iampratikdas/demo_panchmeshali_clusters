import React , { useEffect, useState } from "react";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { ContentView } from "@/components/dashboard/ContentView";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { Folders } from "@/components/dashboard/Folders";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchContentsTrailers } from "@/store/contentTrailerSlicer";
import { RootState } from "@/store/store";
import { pageName } from "@/store/pageSlicer";
import Modal from "@/pages/molecules/status/ProfileMOdal";
import ModalContent from "./molecules/status/modalContentProfile";
import NoticePage from "./NoticePage"

import { fetchProfile} from "@/auth/api";
import ECertificate from  "@/components/common/ECertificate"
// import { ContentsDashboard } from '../lib/type'
// import { constentResponse } from "../lib/data"
import { useNavigate } from "react-router-dom";
import { Hourglass } from 'react-loader-spinner';
import Swal from 'sweetalert2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface contentitems {
  contents: {
    id: string;
    h1: string;
    p: string;
    img: string;
  };
  id: string;
  parentId: string | null;
  type: string;
}
type content = {
  id: string;
  type: string;
  parentId: string | null;
  contents: contentitems;
}[];
export function Dashboard() {
  const nav = useNavigate();
  const [modal, setModal] = useState(false);
  const [modalData, setModalData] = useState<string>("");
  const [loading , setLoading] = useState(true)
  const [eventsLists, setEventLists] = useState([]);
  const [selectedEvent, setSelected] = useState("");
  const [certificateData , setCertificate] = useState({});
  const [content_trailers, setContentTrailers] = useState<content>([])
  const [_, setContentTrailers_1] = useState<content>([])
  const dispatch = useDispatch<AppDispatch>();
  const contents = useSelector((state: RootState) => state.contents_trailers.data);
  const isLoading_trailers = useSelector((state: RootState) => state.contents_trailers.isLoading);
  useEffect(() => {

    dispatch(pageName("dashboard"));
    dispatch(fetchContentsTrailers());
  }, [dispatch])


  useEffect(()=>{
    // fetch the event lists
    async function fetchEvents(){

      const res = await fetchProfile("/event_lists_users");
      setEventLists(res.data)
      // console.log("chchchc")
    }
    fetchEvents();
  },[])

  useEffect(()=>{
    // fetch the event selected
    try{
      setLoading(true);
      async function fetchSelectedEvents(){
        if(selectedEvent){
          const res = await fetchProfile(`/certificate_fetch?eid=${selectedEvent}`);
          await Swal.fire({
            icon: "success",
            // title: "Successfully submitted!",
            text: res.message,
          });
          setCertificate(res.data)
        }
      }
      fetchSelectedEvents();
    }catch(err){
      setLoading(true);
    }finally{
      setLoading(false);
    }
    
  },[selectedEvent])




  useEffect(() => {
    async function fetchProfileData() {
      const res = await fetchProfile("/getuserprofile");
      if(res.data.isfirstTimeLogin){
        handleModal()
      }
    }
    fetchProfileData()
  }, [])


  const handleModal = () => {
    setModal(!modal);
    setModalData("Please update your profile. Note: Once the name is updated, it cannot be changed later.")
  
  };
  const handleChangeEvent = (value) =>{
    // alert(e.target.value)
    setLoading(true)
    setSelected(value)
    setLoading(false)
    // console.log("valueevent-------------------->", value)
  }
 console.log("loadingevent-------------------->", loading , selectedEvent)
 
  return (
    <React.Fragment>
    {loading && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Hourglass size={100} color="#fff" />
      </div>
    )}
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-[40px] mb-[10px]">Welcome {localStorage.getItem("full_name")}</h4>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <DashboardOverview />
           
      <section className="flex flex-col flex-wrap justify-between gap-4 md:flex-row mt-[4rem!important]">
         <DashboardCards />
      </section>
      {/*
      <section className="flex flex-col flex-wrap justify-between gap-4 md:flex-row mt-[4rem!important]">
         <h1 className="text-[30px] font-bold mb-0">Folders : </h1>
         <Folders />
      </section>*/}
      {/*<div className="flex items-center justify-between mt-[2rem!important]">*/}
       <h1 className="text-[30px] font-bold mb-0">Notice : </h1>
        <section className="flex flex-col flex-wrap justify-center md:gap-4 md:flex-row mt-[1rem!important]">
          

        <NoticePage />
      </section>
       <h1 className="text-[30px] font-bold mb-0">E-Certificate : </h1>
       <Select  onValueChange={handleChangeEvent} >
            <SelectTrigger className="w-[auto]">
              <SelectValue className="whitespace-normal break-words"  placeholder="Choose Your participated Event" />
            </SelectTrigger>
            <SelectContent>
              {
                eventsLists.map((evnt , index)=>{
                  return(<SelectItem key={`${index}-${Math.random()}`} value={evnt.eid}  >{evnt.name}</SelectItem>)
                })
              }
              
            </SelectContent>
          </Select>
        <section className="flex flex-col flex-wrap justify-center md:gap-4 md:flex-row mt-[1rem!important]">


          <div className="w-full overflow-scroll ">
            {
              certificateData && certificateData.editorName ?  (
               <ECertificate
                          writerName={certificateData.writerName}
                          competitionName={certificateData.competitionName}
                          editorName={certificateData.editorName.join(", ") || "Admin"}
                          participantName={certificateData.participantName}
                          logoUrl={certificateData.logoUrl}
                          position={certificateData.position}
                        />
                ) : <div> Not yet found </div> 
            }
         
           </div>
        </section>
     

         
        {modal && (
                <Modal
                  isOpen={modal}
                  // data={modalData}
                  onClose={() => {
                    setModal(false)
                    nav("/profile")
                  }}
                  component={<ModalContent data={modalData} />}
                />
        )}
    </div>
    </React.Fragment>
  );
}
