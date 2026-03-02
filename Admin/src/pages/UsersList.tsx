import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentCard from "@/components/ui/ContentCard";
import FilterComponent from "@/components/common/FilterComponent";
import { useDispatch } from "react-redux";
import { pageName } from "@/store/pageSlicer";
import { contentAll } from "@/auth/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { Hourglass } from 'react-loader-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactPaginate from 'react-paginate'; // ✅ pagination import

export default function StoryStatus() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [includeArchived, setIncludeArchived] = useState<boolean>(false);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("");
  const dispatch = useDispatch();
  const nav = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const itemsPerPage = 5; // how many cards per page

  dispatch(pageName("story-status"));

  const handleApply = () => {
    console.log("filters==>", isOpen, searchText, status, includeArchived);
  };

  const handleReset = () => {
    resetFunc();
  };

  const filterFields = [
    {
      type: "text" as const,
      label: "Search",
      value: searchText,
      onChange: (v: string) => setSearchText(v),
      placeholder: "Type here..."
    },
    {
      type: "buttonGroup" as const,
      label: "Status",
      value: status,
      onChange: (v: string) => setStatus(v),
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
      ]
    }
  ];

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      const res = await contentAll(
        { uid: localStorage.getItem("uid"), eid: { "$eq": "" } },
        "/list_contents"
      );
      setLoading(false);
      if (res == 0) {
        toast.error("UnAuthorized User");
        setTimeout(() => {
          nav("/signin");
        }, 5000);
      }
      setList(res.lists || []);
      setCurrentPage(0); // reset page on tab switch/fetch
    };
    fetchContents();
  }, [tab]);

  const handleChange = (data: string) => {
    setIsOpen(false);
    setTab(data);
    resetFunc();
  };

  const resetFunc = () => {
    setSearchText("");
    setStatus("active");
    setIncludeArchived(false);
  };

  // pagination logic
  const offset = currentPage * itemsPerPage;
  const currentItems = list.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(list.length / itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const renderCards = () => {
    if (currentItems.length > 0) {
      return currentItems.map((items, index) => (
        <div className="mt-2" key={index}>
          <ContentCard
            title={items.name}
            content={items.content.length > 100 ? items.content.slice(0, 100) + " ...." : items.content}
            status={items.status}
            buttonText="Action"
            onButtonClick={() => alert("Clicked!")}
            action={localStorage.getItem("role") === "manager"}
          />
        </div>
      ));
    } else {
      return (
        <div className="w-full mt-2 bg-white rounded-2xl shadow-lg p-5 flex flex-row justify-center">
          No Contents Found
        </div>
      );
    }
  };

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
          colors={['#306cce', '#72a1ed']}
        />
      )}
      <ToastContainer position="bottom-center" />

      <CardContent>
        <Tabs defaultValue={"team"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2">
            <TabsTrigger value="team" className="text-[1rem]" onClick={() => handleChange("team")}>Team Members</TabsTrigger>
            <TabsTrigger value="all_user" className="text-[1rem]" onClick={() => handleChange("all_user")}>All Users</TabsTrigger>
          </TabsList>

          <FilterComponent
            handleReset={handleReset}
            includeArchived={includeArchived}
            setIncludeArchived={setIncludeArchived}
            handleApply={handleApply}
            filterFields={filterFields}
            isOpen={isOpen}
            status={status}
            searchText={searchText}
            setIsOpen={setIsOpen}
            setSearchText={setSearchText}
            setStatus={setStatus}
          />

          <TabsContent value="team">
             <Card className="w-full mx-auto">
            <CardHeader className="bg-gradient-to-tl from-[#500744] to-[#966588] text-white text-2xl rounded-[12px_3px_22px_4px] p-4">
              <CardTitle>Panchmeshali Team Members List</CardTitle>
            </CardHeader>
            {renderCards()}
            {pageCount  && (
               <div className={`overflow-hidden transition-all  delay-2000 duration-1000 max-h-screen pb-2`} >
                      <ReactPaginate
                        breakLabel="..."
                        nextLabel=">"
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={1}
                        pageCount={pageCount}
                        previousLabel="<"
                        containerClassName="flex justify-center mt-4 gap-2"
                        pageClassName="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                        activeClassName="bg-blue-500 text-white"
                        previousClassName="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                        nextClassName="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                      />
                 </div>
            )}

            </Card>
          </TabsContent>

          <TabsContent value="all_user">
            <Card className="w-full mx-auto">
              <CardHeader className="bg-gradient-to-tl from-[#500] to-[#966588] text-white text-2xl rounded-[12px_3px_22px_4px] p-4">
                <CardTitle>Writers and Users</CardTitle>
              </CardHeader>
              {renderCards()}
              {pageCount  && (
                <div className={`overflow-hidden transition-all  delay-2000 duration-1000 max-h-screen pb-2`} >
                <ReactPaginate
                  breakLabel="..."
                  nextLabel=">"
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  marginPagesDisplayed={1}
                  pageCount={pageCount}
                  previousLabel="<"
                  containerClassName="flex justify-center mt-4 gap-2"
                  pageClassName="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                  activeClassName="bg-blue-500 text-white"
                  previousClassName="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                  nextClassName="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                />
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </React.Fragment>
  );
}
