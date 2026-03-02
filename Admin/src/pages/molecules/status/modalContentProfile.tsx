interface Content {
  data: string
}
const modalContentProfile = ({data}: Content) => {
  console.log("modal content====>", data);
    return (
      <>
        <h2 className="text-xl font-semibold mb-4 overflow-y-scroll max-h-[200px]">{data}</h2>
        
        {/* <ul className="list-disc ml-6 mt-4">
          <li>React Modal</li>
          <li>With smooth transitions</li>
          <li>Reusable component</li>
        </ul> */}
      </>
    );
  };
  
  export default modalContentProfile;
  