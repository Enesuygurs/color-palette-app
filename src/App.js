import React, { useState, useEffect } from "react";
import "./App.css"; // CSS dosyasını içe aktar
import { FaLock } from "react-icons/fa";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoAddCircleSharp } from "react-icons/io5";
import { FaUnlock } from "react-icons/fa6";
import { RiColorFilterFill } from "react-icons/ri";
function App() {
  const [colors, setColors] = useState(Array(6).fill(""));
  const [notification, setNotification] = useState("");

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const hexToRgb = (hex) => {
    let r = 0,
      g = 0,
      b = 0;

    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }

    return `rgb(${r}, ${g}, ${b})`;
  };

  // let savedColors = [];
  const checkLocalStorage = () => {
    const savedColors = localStorage.getItem("savedColors");
    return savedColors ? JSON.parse(savedColors) : [];
  };

  useEffect(() => {
    const initializeColors = () => {
      let randomColors = Array(6)
        .fill("")
        .map(() => generateRandomColor());

      const savedColors = checkLocalStorage();

      savedColors.forEach((savedColor) => {
        const index = savedColor.id - 1;
        if (index < randomColors.length) {
          randomColors[index] = savedColor.color;
        } else {
          randomColors.push(savedColor.color);
        }
      });
      console.log("randomColors:", randomColors);
      setColors(randomColors);
    };

    initializeColors(); // Call the function inside useEffect
  }, []);

  const saveColor = (index, color) => {
    // Retrieve existing saved colors from localStorage
    const savedColors = checkLocalStorage();

    // Check if the color is already saved
    const colorObject = savedColors.find((savedColor) => savedColor.id === index + 1);

    if (colorObject) {
      // If the color is already saved, update it
      colorObject.color = color;
    } else {
      // If the color is new, add it to the saved colors array
      savedColors.push({
        id: index + 1,
        color: color,
      });
    }

    // Save the updated colors array back to localStorage
    localStorage.setItem("savedColors", JSON.stringify(savedColors));
    // Notify user and update UI
    setNotification(`Color saved.`);
    setTimeout(() => {
      setNotification("");
    }, 3000);

    // Update state to force re-render if necessary
    setColors([...colors]);
  };

  const removeSavedColor = (index) => {
    let savedColors = checkLocalStorage();

    savedColors = savedColors.filter((color) => color.id !== index + 1);
    localStorage.setItem("savedColors", JSON.stringify(savedColors));

    setNotification(`Color deleted.`);
    setTimeout(() => {
      setNotification("");
    }, 3000);

    setColors([...colors]);
  };

  let changedColor = "";
  function checkColorIsSaved(index) {
    const savedColors = checkLocalStorage();
    console.log("savedColors BAKBKABKAKBAKBKAKBABAK:", savedColors);
    for (let indexs in savedColors) {
      if (savedColors[indexs].id === index + 1) {
        changedColor = savedColors[indexs].color;
        return true;
      }
    }
    return false;
  }

  const removeSection = (index) => {
    if (colors.length === 1) {
      setNotification(`This is last color.`);
      setTimeout(() => {
        setNotification("");
      }, 3000);
      return;
    }
    const newColors = [...colors];
    newColors.splice(index, 1);
    setColors(newColors);
  };

  const createSimilarColor = (color) => {
    if (colors.length >= 8) {
      setNotification(`Maximum 8 colors can be created.`); // Bildirim mesajını ayarla
      setTimeout(() => {
        setNotification(""); // 3 saniye sonra bildirimi temizle
      }, 3000);
      return;
    }
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    r = r + 10 > 255 ? 255 : r + 10;
    g = g + 10 > 255 ? 255 : g + 10;
    b = b + 10 > 255 ? 255 : b + 10;
    const newColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

    const newColors = [...colors];
    newColors.push(newColor);
    setColors(newColors);
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color).then(
      () => {
        setNotification(`Copied to clipboard: ${color}`);
        setTimeout(() => {
          setNotification("");
        }, 3000);
      },
      (err) => {
        console.error("An error occurred while copying the color code to the clipboard: ", err);
      }
    );
  };
  return (
    <div className="App">
      <div className="header">
        <ul>
          <li>
            <a href="#home">Home</a>
          </li>
          <li className="navbarButton">
            <RiColorFilterFill />
          </li>
          <li>
            <a href="#news">News</a>
          </li>
        </ul>
      </div>

      {/* Section'ları bir container içine alıyoruz */}
      <div className="sections-container">
        {colors.map((color, indexim) => (
          <div
            key={indexim}
            className="section"
            style={{
              backgroundColor: checkColorIsSaved(indexim) ? changedColor : color,
            }}
          >
            <div className="parts">
              <div className="mybuttons">
                {checkColorIsSaved(indexim) ? (
                  <div className="buttons" onClick={() => removeSavedColor(indexim)}>
                    <FaUnlock />
                  </div>
                ) : (
                  <div className="buttons" onClick={() => saveColor(indexim, color)}>
                    <FaLock />
                  </div>
                )}
                <div className="buttons" onClick={() => createSimilarColor(checkColorIsSaved(indexim) ? changedColor : color)}>
                  <IoAddCircleSharp />
                </div>
                <div className="buttons" onClick={() => removeSection(indexim)}>
                  <IoIosRemoveCircle />
                </div>
              </div>

              <div className="colorcodes">
                <div className="text" onClick={() => copyToClipboard(checkColorIsSaved(indexim) ? changedColor : color)}>
                  {checkColorIsSaved(indexim) ? changedColor : color}
                </div>
                <div className="text" onClick={() => copyToClipboard(checkColorIsSaved(indexim) ? hexToRgb(changedColor) : hexToRgb(color))}>
                  {checkColorIsSaved(indexim) ? hexToRgb(changedColor) : hexToRgb(color)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notification && <div className={`notification ${notification ? "show" : ""}`}>{notification}</div>}
    </div>
  );
}

export default App;
