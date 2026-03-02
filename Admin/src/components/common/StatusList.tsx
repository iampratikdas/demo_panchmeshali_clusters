import React, { useEffect, useState , useCallback} from "react";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hourglass } from "react-loader-spinner";
import ReactPaginate from "react-paginate";
import ContentCard from "@/components/ui/ContentCard";
import FilterComponent from "@/components/common/FilterComponent";
import { contentAll , fetchProfile } from "@/auth/api";
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentPageStatus, resetPage, clearReset } from '../../store/currentPageSlicer';
import Modal from "@/pages/molecules/status/ProfileMOdal";
import ModalContent from "@/pages/molecules/status/modalMarksContent.tsx";
import Swal from 'sweetalert2';

export default function StatusList({
  statusValue = "Writer Name",
  statusDesc = "Status of your Page Contents",
  cardTitleDesc = "Here you can see the status of your content (Status of your content will change from Pending to Approve or Reject after Editor's confirmation)",
  payload,
  filterFields,
  handleApply,
  resetFunc,
  type,
  isOpen ,
  status ,
  searchText ,
  handleOPen ,
  setSearchText ,
  setStatus,
  setSearchTextInput,
  setSearchTextDrop,
  // applyFilter,
  handlePage
}) {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [_, copyToClipboard] = useCopyToClipboard();
  const { currentPageStatus, reset , active_Tab} = useSelector((state) => state.currentPageStatus);
  const [loading, setLoading] = useState(false);
  // const [tab, setTab] = useState("");
  // pagination (1-based)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [list, setList] = useState<any[]>([]);
  const [totalContents, setTotalContents] = useState<number>(0);
  //modal states
  const [modal , setModal] = useState<boolean>(false)
  const [modalData, setModalData] = useState<string>(""); 
  const [marks , setMarks]= useState<number>(1);
  const [statusStory ,setStatusStory] = useState<string>("Reviewing")
  const fetchContents = useCallback(async () => {
    setLoading(true);
    // handleApply(setCurrentPage ,setItemsPerPage); 
   
    try {
      const respage = await contentAll(
        payload,
        `/list_contents?page=${currentPageStatus}&limit=${itemsPerPage}`
      );

      if (respage === 0) {
        toast.error("UnAuthorized User");
        setTimeout(() => nav("/signin"), 2000);
        return;
      }
       console.log("applyFilter=============>", respage)
      setList(respage.lists);
      setItemsPerPage(respage.pagination.pageSize);
      setTotalContents(respage.pagination.totalContents);
    } catch (err) {
      console.error("Error fetching contents:", err);
      toast.error("Something went wrong while fetching contents.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, payload]);


  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

 // const addMarksSubmit = useCallback(async (data) => {
 //    console.log("marksdata===============>", data)
 // },[])
  // useEffect(() => {
  //   addMarksSubmit();
  // }, [addMarksSubmit]);

  const handleReset = () => {
    resetFunc();
    setCurrentPage(1); // reset to page 1 when filters reset
  };

  const pageCount = Math.ceil(totalContents / itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1); // 0-based → 1-based
    dispatch(setCurrentPageStatus(event.selected + 1));
  };
  const handlAddMarks = (data) =>{
    // let datas = {...modalData , marks: {score: data , uid : modalData.uid} }
    setMarks(data)
  }
  const handleSubmitMarks = ()=>{
    try{
      setLoading(true);
      setModal(false);
     async function submitMarks(){
       

    const payload_marks = ({
      marks: marks,
      status: statusStory,
      cont_id: modalData.cont_id,
      event: active_Tab === "page_story" ? false : true,
      filter: {
        eid: modalData.eid,
      },
      sortBy:
        active_Tab === "page_story"
          ? { updatedAt: -1, _id: -1 }
          : { totalMarks: -1, _id: -1 },
    });

      console.log("marksdata===============>", payload_marks);
      // return
    const respage = await contentAll(
        payload_marks,
        `/add_marks_by_admins?page=${currentPage}&limit=${itemsPerPage}`
      );

      if (respage === 0) {
        toast.error("UnAuthorized User");
        setTimeout(() => nav("/signin"), 2000);
        return;
      }

      setList(respage.lists);
      // setItemsPerPage(5);
      // setCurrentPage(1);
      // setMarks(1);
      // setTotalContents(5);
     }
     submitMarks()
    }catch(err){
      setLoading(false)
    }finally{
      setLoading(false)
    }
    
  }

  const handleModalContent = async (eid , cont_id)=>{
    try{
       setLoading(true);
       const respage = await fetchProfile(`/fetch_the_content?eid=${eid}&cont_id=${cont_id}`);
     console.log("respage========>",respage , eid , cont_id );
      if (respage === 0) {
        toast.error("UnAuthorized User");
        setTimeout(() => nav("/signin"), 2000);
        return;
      }
      if(Object.keys(respage.lists).length === 0){
        await Swal.fire({
        icon: "error",
        title: "Sorry!",
        text: respage.message,
      });
        return
      }
    setModal(!modal) ;

    let preparemodalcontent = {
      "uid": respage.lists[0].uid,
      "type": respage.lists[0].type,
      "name": respage.lists[0].name,
      "author_name": respage.lists[0].author_name,
      "status": respage.lists[0].status,
      "content": respage.lists[0].content,
      "url": respage.lists[0].url,
      "eid": respage.lists[0].eid,
      "event_content": respage.lists[0].event_content,
      "orgin_content": respage.lists[0].orgin_content,
      "cont_id": respage.lists[0].cont_id,
      ...(respage.lists[0].marks ? {"marks" : respage.lists[0].marks}  : {"marks" : {score: 0 , uid: ""}})
    }
    // setMarks(respage.lists[0]?.marks ? Number( respage.lists[0]?.marks.find(elem => elem.uid === localStorage.getItem("uid") ?? 0)) : 1 );
    console.log("preparemodalcontent======>", preparemodalcontent);
    setModalData(preparemodalcontent)
    setMarks(respage.lists[0]?.marks ?  respage.lists[0].marks.score : 0);
    setStatusStory(respage.lists[0].status);
    }catch(err){
      setLoading(false);
    }finally{
       setLoading(false);
    }
    
  }
  // console.log("moxdsddal==============>",marks ,statusStory ,  modalData , list , currentPageStatus, reset , active_Tab )
  

  return (
    <React.Fragment>
      {loading && (
        <Hourglass
          visible={true}
          ariaLabel="hourglass-loading"
          wrapperStyle={{
            position: "absolute",
            zIndex: "1000",
            top: "50%",
            left: "50%"
          }}
          colors={["#306cce", "#72a1ed"]}
        />
      )}

      <TabsContent value={statusValue}>
        <FilterComponent
          handleReset={handleReset}
          // includeArchived={includeArchived}
          // setIncludeArchived={setIncludeArchived}
          handleApply={handleApply}
          filterFields={filterFields}
          isOpen={isOpen}
          status={status}
          searchText={searchText}
          setSearchTextInput={setSearchTextInput}
          setSearchTextDrop={setSearchTextDrop}
          handleOPen={handleOPen}
          setSearchText={setSearchText}
          setStatus={setStatus}
        />

        <CardHeader className="bg-gradient-to-tl from-[#500] to-[#966588] text-white text-2xl rounded-[12px_3px_22px_4px] p-4">
          <CardTitle>{statusDesc}</CardTitle>
          <CardDescription className="text-white">
            {cardTitleDesc}
          </CardDescription>
        </CardHeader>

        {list.length > 0 ? (
          list.map((items, index) => (
            <div className="mt-2" key={items.id || index}>
              <ContentCard
                title={items.name}
                content={
                  items.content.length > 100
                    ? items.content.slice(0, 100) + " ...."
                    : items.content
                }
                status={items.status}
                checktab={active_Tab === "page_story" ? false : true}
                totMarks={items.totalMarks}
                author_name={items.author_name}
                allData={items}
                buttonText="Action"
                onButtonClick={()=>handleModalContent(items.eid , items.cont_id)}
                action={
                  localStorage.getItem("role") === "manager" ||
                  localStorage.getItem("role") === "admin"
                }
              />
            </div>
          ))
        ) : (
          <div className="w-full mt-2 bg-white rounded-2xl shadow-lg p-5 flex flex-row justify-center">
            No Contents Found
          </div>
        )}

        {pageCount > 1 && (
          <div className="overflow-hidden transition-all delay-2000 duration-1000 max-h-screen pb-2">
  

            <ReactPaginate
              breakLabel="..."
              nextLabel=">"
              previousLabel="<"
              onPageChange={handlePageClick}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={pageCount}
              forcePage={currentPage - 1} // 1-based → 0-based for UI
              containerClassName="flex justify-center mt-4 gap-2"

              // Normal page buttons
              pageLinkClassName="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"

              // Active page button
              activeLinkClassName="px-3 py-1 rounded bg-white border-2 border-red-500 text-red-500 cursor-pointer"

              // Prev/Next buttons
              previousLinkClassName="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
              nextLinkClassName="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"

              // Break "..." styling
              breakLinkClassName="px-3 py-1 rounded bg-gray-200"
            />


          </div>
        )}
        {modal && (

          <div
              className={`m-0 fixed left-0 top-0 w-full h-full bg-[#00000080] z-[1000] backdrop-sepia flex items-center justify-center ${
                modal ? "opacity-100 visible" : "opacity-0 invisible"
              } transition-opacity duration-300 ease-in-out`}
              style={{margin:"0px"}}
            >
              <div
                className={`bg-white m-10 p-6  rounded-lg shadow-lg w-[400px] transform-gpu transition-transform duration-300 ${
                  modal ? "scale-100" : "scale-75"
                }`}
              >
                <ModalContent data={modalData} />
               <Button className="mt-2" onClick={() => copyToClipboard(modalData.content)}>Copy</Button>
                <div className="flex flex-col lg:flex-row flex-wrap justify-between">
              {
                (()=>{
                  if(active_Tab === "event_story"){
                    return (
                      <Input
                        type="number"
                        value={Number(marks || 0)}
                        onChange={(e) => handlAddMarks(Number(e.target.value))}
                        className="mt-4 px-4 w-[100%] w-full md:w-[40%]  py-2  focus:outline-none "
                        min={0}
                        defaultValue={1}
                        max={10}
                      />
                      )
                  }
                })()
              }

               <select
                    value={statusStory}
                    onChange={(e) => setStatusStory(e.target.value)}
                    className="mt-4 px-2 w-[100%] w-full md:w-[40%]  py-2  focus:outline-none border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option key="Approved" value="Approved">
                        Approved
                      </option>
                      <option key="Reviewing" value="Reviewing">
                        Reviewing
                      </option>
                      <option key="Pending" value="Pending">
                        Pending
                      </option>
                      <option key="Rejected" value="Rejected">
                        Rejected
                      </option>
                       <option key="Published" value="Published">
                        Published
                      </option>
               </select>
              
                
               <Button
                className="mt-4 px-4 py-2 text-white focus:outline-none"
                onClick={handleSubmitMarks}
              >
                { "Submit marks"}
              </Button>

              <Button
                className="mt-4 px-4 py-2 bg-red-800 text-white focus:outline-none"
                onClick={()=> setModal(false)}
              >
                { "Cancel"}
              </Button>
            </div>
            </div>
          </div>

                
        )}

      </TabsContent>
    </React.Fragment>
  );
}
