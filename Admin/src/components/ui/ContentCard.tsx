import  {useEffect} from "react";

const Card = ({ title, content, status, buttonText, onButtonClick , action , totMarks, author_name , checktab , allData}) => {


  return (
    <div className="w-full  bg-white rounded-2xl shadow-lg p-5 flex flex-col justify-between" key={Math.random()}>
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold mb-3">{title}</h2>
      {
  (localStorage.getItem("role") === "admin" || localStorage.getItem("role") === "manager") && (
    <h3 className="text-xl sm:text-2xl font-bold mb-1">{author_name}</h3>
  )
}

      

      {/* Content */}
      <p id="contentText" className="text-gray-600 text-base sm:text-lg mb-6">{content}</p>

      {/* Footer */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm: ${onButtonClick ? "justify-between" : "justify-end"} gap-3`}>

        <span className="text-green-600 font-medium">{status}</span>

        {
          checktab && <span className="text-red-600 font-medium">Marks :{totMarks}</span>
        }
        {
          (()=>{
            if(checktab && allData?.marks != undefined){
              console.log("allData=============>",allData?.marks)
                if(allData?.marks.some(elem => elem.uid === localStorage.getItem("uid")) ){
                  return (
                     <span className="text-red-600 font-medium">
                      Marks Given By You:{" "}
                      {allData?.marks.find(elem => elem.uid === localStorage.getItem("uid")).score ?? "N/A"}
                    </span>
                    )
                }
            }
          })()
        }
        {/*{checktab && allData?.marks && allData?.marks.some(elem => elem.uid === localStorage.getItem("uid")) && (
        <span className="text-red-600 font-medium">
          Marks Given By You:{" "}
          {allData?.marks.find(elem => elem.uid === localStorage.getItem("uid")) ?? "N/A"}
        </span>
      )}*/}


         
        {
          action === true && (
            <button
          onClick={onButtonClick}
          className="bg-[hsl(var(--primary))] hover:bg-blue-600 text-white text-sm sm:text-base px-5 py-2 rounded-md transition-colors duration-200"
        >
          {buttonText}
        </button>
            )
        }
        
      </div>
    </div>
  );
};

export default Card;
