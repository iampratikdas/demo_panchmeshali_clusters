
const modalMarksContent = ({data}) => {
  console.log("modal content====>", data);
    return (
      <div className="overflow-y-scroll max-h-[300px]">
        <h2 className="text-xl font-semibold mb-4 ">{data.name}</h2>
        <h2 className="text-xl font-semibold mb-1 ">Writer : {data.author_name}</h2>
        <p> {data.content}</p>
        {/* <ul className="list-disc ml-6 mt-4">
          <li>React Modal</li>
          <li>With smooth transitions</li>
          <li>Reusable component</li>
        </ul> */}
      </div>
    );
  };
  
  export default modalMarksContent;
  