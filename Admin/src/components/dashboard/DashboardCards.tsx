// import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FaCalendarAlt, FaFileAlt, FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export function DashboardCards() {
  const nav = useNavigate();
  const cards = [
    {
      title: "Event Content Submission",
      icon: <FaCalendarAlt size={32} className="text-orange-600" />,
      description: "Submit your event details and related content easily.",
      style: "bg-[linear-gradient(120deg,_rgba(27,255,255,0),_rgb(149_159_127/58%))] cursor-pointer",
      route: "/submit/event_story"
    },
    {
      title: "Page Content Submission",
      icon: <FaFileAlt size={32} className="text-blue-600" />,
      description: "Add or update your page content for review.",
      style: "bg-[linear-gradient(120deg,_rgba(27,255,255,0),_rgb(159_127_143/58%))] cursor-pointer",
      route: "/submit/page_story"
    },
    {
      title: "Content Status",
      icon: <FaClipboardList size={32} className="text-green-600" />,
      description: "Check the review and approval status of your submissions.",
       style: "bg-[linear-gradient(120deg,_rgba(27,255,255,0),_rgb(66_194_183/58%))] cursor-pointer",
       route: "/status"
    },
  ];

  return (
    <div className="flex flex-col justify-between sm:flex-row gap-[25px] w-full ">
      {cards.map((card, index) => (
        <Card
          key={index}
          // style={{border:"solid blue"}}
          className={`${card.style} w-full border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300`}
        >
          <CardContent className="flex flex-col items-center text-center p-6 " onClick={()=> nav(card.route)}>
            <div className="mb-4">{card.icon}</div>
            <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
            <p className="text-gray-600 text-sm">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
