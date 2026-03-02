import { FaFolder } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosAdd } from "react-icons/io";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function Folders() {
  const nav = useNavigate();
  const menuRef = useRef(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [folders, setFolders] = useState([
    { id: 1, name: "Projects" },
    { id: 2, name: "Photos" },
    { id: 3, name: "Work" },
    { id: 4, name: "Clients" },
    { id: 5, name: "Travel" },
    { id: 6, name: "Music" },
    { id: 7, name: "Videos" },
    { id: 8, name: "Docs" }
  ]);

  // ------------------ MENU ------------------
  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleOption = (option, id) => {
    setOpenMenuId(null);

    switch (option) {
      case "move":
        alert("Move: " + id);
        break;
      case "rename":
        alert("Rename: " + id);
        break;
      case "delete":
        alert("Delete: " + id);
        break;
      case "info":
        alert("Info: " + id);
        break;
    }
  };

  // CLICK OUTSIDE TO CLOSE MENU
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ------------------ SEARCH ------------------
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ------------------ SORT ------------------
  const sortedFolders = [...filteredFolders].sort((a, b) =>
    sortOrder === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );

  // ------------------ ADD FOLDER ------------------
  const addFolder = () => {
    const name = prompt("Enter folder name:");
    if (!name) return;

    const newFolder = {
      id: Date.now(),
      name: name
    };

    setFolders((prev) => [...prev, newFolder]);
  };

  return (
    <div className="w-full">

      {/* =================== TOP BAR =================== */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 border-2 bg-[#e2e8f0] border-solid p-3 rounded-[20px]">

        {/* Search */}
        <input
          type="text"
          placeholder="Search folder..."
          className="border px-3 py-2 rounded-lg w-full sm:w-[250px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Sort Dropdown */}
        <select
          className="border px-3 py-2 rounded-lg w-full sm:w-[250px]"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Sort A - Z</option>
          <option value="desc">Sort Z - A</option>
        </select>

        {/* Add Folder Button */}
        <button
          onClick={addFolder}
          className="flex items-center justify-center bg-blue-600 text-white w-full sm:w-[200px] px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <IoIosAdd size={22} className="mr-1" />
          Create Folder
        </button>
      </div>

      {/* =================== FOLDER GRID =================== */}
      <div className="flex flex-wrap gap-4 w-full">
        {sortedFolders.map((folder) => (
          <div
            key={folder.id}
            ref={menuRef}
            onClick={()=>nav(`/folders/${folder.id}`)}
            className="relative flex flex-col items-center p-4 rounded-xl w-full sm:w-[150px] md:w-[120px] cursor-pointer hover:shadow-lg transition-all"
          >
            {/* 3 Dots Button */}
            <button
              className="absolute top-2 right-2 p-[1px]  text-gray-500 hover:text-black"
              onClick={(e) => toggleMenu(e, folder.id)}
            >
              <BsThreeDotsVertical size={18} />
            </button>

            {/* Folder Icon */}
            <FaFolder className="w-12 h-12 text-yellow-500" />

            <p className="text-sm font-semibold mt-2 text-center">
              {folder.name.length > 8
                ? folder.name.substring(0, 8) + "..."
                : folder.name}
            </p>

            {/* Menu */}
            {openMenuId === folder.id && (
              <div className="absolute top-8 right-2 bg-white shadow-lg border rounded-md w-36 z-50">
                <ul className="text-sm text-gray-700">
                  <li
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleOption("move", folder.id)}
                  >
                    Move Folder
                  </li>
                  <li
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleOption("rename", folder.id)}
                  >
                    Rename Folder
                  </li>
                  <li
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                    onClick={() => handleOption("delete", folder.id)}
                  >
                    Delete Folder
                  </li>
                  <li
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleOption("info", folder.id)}
                  >
                    Folder Info
                  </li>
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
