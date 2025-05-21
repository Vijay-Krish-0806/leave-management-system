import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { FaChevronUp, FaX } from "react-icons/fa6";
import "./css/DropDownSearch.css";
import { User } from "../types";

/**
 * DropDownWithSearch component for selecting a user from a searchable dropdown list.
 *
 * This component allows users to search for and select a manager from a list of users.
 * It displays the selected user's name and provides a search input to filter the options.
 *
 * @param {Object} props - The component props.
 * @param {User []} props.usersList - The list of users to display in the dropdown.
 * @param {User  | null} props.initialUser  - The initially selected user, if any.
 * @param {string} [props.placeholder="Select Managers"] - The placeholder text for the search input.
 * @param {boolean} props.required - Indicates if the selection is required.
 * @returns {JSX.Element} The rendered DropDownWithSearch component.
 *
 * @example
 * return (
 *   <DropDownWithSearch
 *     usersList={userList}
 *     initialUser ={initialUser }
 *     placeholder="Select a manager"
 *     required={true}
 *   />
 * );
 */

type UserProps = User;
interface Props {
  usersList: UserProps[];
  initialUser: UserProps | null;
  placeholder: string;
  required: boolean;
}

const DropDownWithSearch: React.FC<Props> = ({
  usersList,
  initialUser,
  placeholder = "Select Managers",
  required,
}) => {
  const [search, setSearch] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<UserProps | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = usersList?.filter((user: UserProps) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: UserProps) => {
    setSelectedOption(option);
    setIsOpen(false);
    setSearch("");
  };

  const handleCancel = (event: React.FormEvent) => {
    event.stopPropagation();
    setSelectedOption(null);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} className="dropdown-container">
      <div onClick={() => setIsOpen(!isOpen)} className="dropdown-header">
        <div className="dropdown-selected">
          {!isOpen && selectedOption ? (
            <div className="selected-option">
              <span>{selectedOption.username}</span>
              <button onClick={handleCancel} className="cancel-button">
                <FaX />
              </button>
            </div>
          ) : (
            <div className="search-input">
              <FaSearch />
              <input
                type="text"
                placeholder={
                  selectedOption ? selectedOption.username : placeholder
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onFocus={() => setIsOpen(true)}
              />
            </div>
          )}
        </div>
        <div className="dropdown-icon">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>
      {isOpen && (
        <div className="dropdown-options">
          {filterOptions.length > 0 ? (
            filterOptions.map((option: UserProps) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option)}
                className="dropdown-option"
              >
                {option.username}
              </div>
            ))
          ) : (
            <div className="no-results">No results found</div>
          )}
        </div>
      )}
      <input
        type="hidden"
        name="assigned"
        value={selectedOption ? selectedOption.id : initialUser?.managerId}
        required={required}
      />
    </div>
  );
};

export default DropDownWithSearch;
