export type ContactRelationship = 
  | "College friend"
  | "Former colleague"
  | "Current colleague"
  | "Client"
  | "Neighbor"
  | "School friend"
  | "Family friend"
  | "Person met at an event"
  | "Freelancer"
  | "Photographer"
  | "Doctor"
  | "Business contact"
  | "Unknown";

export interface Contact {
  id: string;
  name: string;
  image?: string;
  phone: string;
  location?: string;
  relationship?: ContactRelationship;
  notes?: string;
  imported: boolean;
  hasDetails: boolean;
}

export const DUMMY_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Rahul Sen",
    phone: "+91 98765 43210",
    location: "Kolkata",
    relationship: "Former colleague",
    notes: "Worked together on a 2024 project. Usually met around Salt Lake.",
    imported: false,
    hasDetails: true,
  },
  {
    id: "2",
    name: "Ananya Roy",
    phone: "+91 87654 32109",
    location: "Durgapur",
    relationship: "College friend",
    notes: "We were in the same engineering batch.",
    imported: false,
    hasDetails: true,
  },
  {
    id: "3",
    name: "Arjun Mehta",
    phone: "+91 76543 21098",
    location: "Bengaluru",
    relationship: "Client",
    notes: "From the previous freelancing project.",
    imported: false,
    hasDetails: true,
  },
  {
    id: "4",
    name: "Sneha Das",
    phone: "+91 65432 10987",
    location: "Kolkata",
    relationship: "Photographer",
    notes: "Met her at a photography group meetup.",
    imported: false,
    hasDetails: true,
  },
  {
    id: "5",
    name: "Vikram Singh",
    phone: "+91 54321 09876",
    location: "Mumbai",
    relationship: "Business contact",
    notes: "Met at the tech conference in 2023.",
    imported: false,
    hasDetails: true,
  },
  {
    id: "6",
    name: "Priya Sharma",
    phone: "+91 43210 98765",
    imported: true,
    hasDetails: false,
  },
  {
    id: "7",
    name: "Rahul Das",
    phone: "+91 32109 87654",
    imported: true,
    hasDetails: false,
  },
  {
    id: "8",
    name: "Sayan Roy",
    phone: "+91 21098 76543",
    imported: true,
    hasDetails: false,
  },
  {
    id: "9",
    name: "Amit Ghosh",
    phone: "+91 10987 65432",
    imported: true,
    hasDetails: false,
  },
  {
    id: "10",
    name: "Dr. A. Gupta",
    phone: "+91 09876 54321",
    location: "Salt Lake",
    relationship: "Doctor",
    notes: "Dentist.",
    imported: false,
    hasDetails: true,
  },
  {
    id: "11",
    name: "Siddharth Bose",
    phone: "+91 99887 76655",
    location: "New Town",
    relationship: "Neighbor",
    notes: "Lives in apartment 4B.",
    imported: false,
    hasDetails: true,
  },
  {
    id: "12",
    name: "Riya Chakraborty",
    phone: "+91 88776 65544",
    location: "Kolkata",
    relationship: "School friend",
    notes: "Known since 5th grade.",
    imported: false,
    hasDetails: true,
  },
  {
    id: "13",
    name: "Kabir Khan",
    phone: "+91 77665 54433",
    location: "Delhi",
    relationship: "Freelancer",
    notes: "Did some UI design work for us.",
    imported: false,
    hasDetails: true,
  },
  {
    id: "14",
    name: "Neha Patel",
    phone: "+91 66554 43322",
    location: "Pune",
    relationship: "Person met at an event",
    notes: "Met at the Startup weekend.",
    imported: false,
    hasDetails: true,
  },
  {
    id: "15",
    name: "Ravi Teja",
    phone: "+91 55443 32211",
    location: "Hyderabad",
    relationship: "Current colleague",
    notes: "Works in the backend team.",
    imported: false,
    hasDetails: true,
  }
];
