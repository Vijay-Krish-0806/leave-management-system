import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { FaChevronUp, FaX } from "react-icons/fa6";
import "./css/DropDownSearch.css";
import { User } from "../types";

type UserProps = User;
interface Props {
  usersList: UserProps[];
  initialUser: UserProps | undefined;
  placeholder: string;
  required: boolean;
}
/**
* @description
 * DropDownWithSearch component for selecting a user from a searchable dropdown list.
 *
 * This component allows users to search for and select a manager from a list of users.
 * It displays the selected user's name and provides a search input to filter the options.
* @param {Props} { 
  usersList,
  initialUser,
  placeholder = "Select Managers",
  required,
}
* @returns {JSX.Element}
*/
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
    /**
     * @description to close the dropdown if clicked outside of the dropdown area
     * @param {MouseEvent} event
     * @returns {void}
     */
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
  /**
   * @description to handle the selected option
   * @param {UserProps} option
   * @returns {void}
   */
  const handleSelect = (option: UserProps) => {
    setSelectedOption(option);
    setIsOpen(false);
    setSearch("");
  };
  /**
   * @description to remove selected value from input
   * @param {React.FormEvent} event
   * @returns {void}
   */
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
