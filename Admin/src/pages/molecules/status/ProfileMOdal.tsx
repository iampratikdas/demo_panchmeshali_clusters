import { Button } from "@/components/ui/button"
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    component: React.ReactNode; 
    // data:  { [key: string]: string }
  }
  
  const ProfileMOdal: React.FC<ModalProps> = ({ isOpen, onClose, component   }) => {
   
    return (
      <div
        className={`m-0 fixed left-0 top-0 w-full h-full bg-[#00000080] z-[1000] backdrop-sepia flex items-center justify-center ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        } transition-opacity duration-300 ease-in-out`}
        style={{margin:"0px"}}
      >
        <div
          className={`bg-white m-10 p-6 rounded-lg shadow-lg w-[400px] transform-gpu transition-transform duration-300 ${
            isOpen ? "scale-100" : "scale-75"
          }`}
        >
          {component}
       
          <Button className="mt-4 px-4 py-2  text-white focus:outline-none"  onClick={onClose}>Go to Profile</Button>
        </div>
      </div>
    );
  };
  
  export default ProfileMOdal;
  