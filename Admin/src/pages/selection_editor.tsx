// import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TableComp from "@/components/common/TableComp";
import { useDispatch } from "react-redux";
import { pageName } from "@/store/pageSlicer";
import { useState } from "react";
import ModalContent from "./molecules/status/modalContent";
import Modal from "@/pages/molecules/status/modal";
export default function SelectionEditor() {
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);
  const [modalData , setModalData] = useState({});
  dispatch(pageName("selection-editor"));
  const columns = [
    {
      id: "story_name",
      header_name: "Story Name",
    },
    {
      id: "status",
      header_name: "Status",
    },
    {
      id: "date",
      header_name: "Approved Date",
      // cell:
    },
    {
      id: "submitted_date",
      header_name: "Submitted Date",
    },

    // {
    //   id:"action",
    //   header_name: "Action"
    // }
  ];
 

  // interface Data {
  //   story_name: string;
  //   submitted_date: string;
  //   status: string;
  //   date: string;
  // }

  const handleModal = (data: { [key: string]: string }) => {
    setModal(!modal);
    setModalData(data)
  
  };
  const data = [
    {
      story_name: "The Story of the Lion and the Mouse",
      submitted_date: "12/12/2021",
      status: "Approved",
      date: "12/12/2021",
    },
    {
      story_name: "This is the story of the tortoise and the hare",
      submitted_date: "12/12/2021",
      status: "Rejected",
      date: "12/12/2021",
      // action: (()=>{
      //   return <button onClick={handleModal}>Click me</button>
      // })(),
    },
  ];

  return (
    <>
      <Card className="w-full max-w-7xl  mx-auto">
        <CardHeader className="bg-gradient-to-tl from-[#500744] to-[#967465] text-white text-2xl rounded-[12px_3px_22px_4px] p-4">
          <CardTitle>Selection Board</CardTitle>
          {/* <CardDescription>Here </CardDescription> */}
        </CardHeader>
        <CardContent>
          <TableComp
            column={columns}
            data={data}
            onclicks={handleModal}
            checkClick={true}
          />
        </CardContent>
      </Card>
      {/* modal open or close */}
      {modal && (
        <Modal
          isOpen={modal}
          // data={modalData}
          onClose={() => setModal(false)}
          component={<ModalContent data={modalData} />}
        />
      )}
    </>
  );
}
