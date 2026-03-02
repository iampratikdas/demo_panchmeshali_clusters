interface Content {
  data:  { [key: string]: string }
}
const ModalContent = ({data}: Content) => {
  console.log("modal content====>", data);
    return (
      <>
        <h2 className="text-xl font-semibold mb-4">{data.story_name}</h2>
        <p className="text-gray-700">{data?.story}</p>
        <p className="text-gray-700">Submitted Date: {data?.submitted_date}</p>
        {/* <ul className="list-disc ml-6 mt-4">
          <li>React Modal</li>
          <li>With smooth transitions</li>
          <li>Reusable component</li>
        </ul> */}
      </>
    );
  };
  
  export default ModalContent;
  