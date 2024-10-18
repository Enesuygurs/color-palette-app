import React, { useState, useEffect } from "react";
import "./App.css";
import { FaLock } from "react-icons/fa";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoAddCircleSharp } from "react-icons/io5";
import { FaUnlock } from "react-icons/fa6";
import { RiColorFilterFill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { HexColorPicker } from "react-colorful";
import { FaPalette } from "react-icons/fa"; // Renk seçici için ikon

function App() {
  const [colors, setColors] = useState(Array(6).fill(""));
  const [notification, setNotification] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
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
      setColors(randomColors);
    };

    initializeColors();
  }, []);

  const saveColor = (index, color) => {
    const savedColors = checkLocalStorage();

    if (savedColors.length >= 6) {
      setNotification(`You can save a maximum of 6 colors.`);
      setTimeout(() => {
        setNotification("");
      }, 3000);
      return;
    }

    const colorObject = savedColors.find((savedColor) => savedColor.id === index + 1);

    if (colorObject) {
      colorObject.color = color;
    } else {
      savedColors.push({
        id: index + 1,
        color: color,
      });
    }

    localStorage.setItem("savedColors", JSON.stringify(savedColors));
    setNotification(`Color saved.`);
    setTimeout(() => {
      setNotification("");
    }, 3000);
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
      setNotification(`This is the last color, it cannot be removed.`);
      setTimeout(() => {
        setNotification("");
      }, 3000);
      return;
    }

    const newColors = colors.filter((_, idx) => idx !== index);

    setColors(newColors);
  };

  const createSimilarColor = (color) => {
    if (colors.length >= 8) {
      setNotification(`Maximum 8 colors can be created.`);
      setTimeout(() => {
        setNotification("");
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

  const handleColorChange = (color) => {
    if (selectedColorIndex !== null) {
      const newColors = [...colors];
      newColors[selectedColorIndex] = color;
      setColors(newColors);

      // Eğer renk kaydedilmişse, localStorage'ı güncelle
      const savedColors = checkLocalStorage();
      const colorObject = savedColors.find((savedColor) => savedColor.id === selectedColorIndex + 1);
      if (colorObject) {
        colorObject.color = color;
        localStorage.setItem("savedColors", JSON.stringify(savedColors));
      }
    }
  };

  const handlePickerPosition = (buttonElement) => {
    const rect = buttonElement.getBoundingClientRect();
    setPickerPosition({
      top: rect.top - 210, // Butonun hemen üstünde olacak şekilde konumlandırın
      left: rect.left + rect.width / 2 - 60, // Picker'ı ortalamak için
    });
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
      <div className="sections-container">
        {colors.map((color, indexim) => (
          <div key={indexim} className="section" style={{ backgroundColor: color }}>
            <div className="parts">
              <div className="mybuttons">
                {indexim < 6 &&
                  (checkColorIsSaved(indexim) ? (
                    <div className="buttons" onClick={() => removeSavedColor(indexim)}>
                      <FaUnlock />
                    </div>
                  ) : (
                    <div className="buttons" onClick={() => saveColor(indexim, color)}>
                      <FaLock />
                    </div>
                  ))}
                <div
                  className="buttons"
                  onClick={(e) => {
                    handlePickerPosition(e.currentTarget);
                    setShowColorPicker(true);
                    setSelectedColorIndex(indexim);
                  }}
                >
                  <FaPalette /> {/* Renk seçici için ikon */}
                </div>
                <div className="buttons" onClick={() => createSimilarColor(checkColorIsSaved(indexim) ? changedColor : color)}>
                  <IoAddCircleSharp />
                </div>
                <div className="buttons" onClick={() => removeSection(indexim)}>
                  <IoIosRemoveCircle />
                </div>
              </div>

              <div className="colorcodes">
                <div className="text" onClick={() => copyToClipboard(colors[indexim])}>
                  {colors[indexim]}
                </div>
                <div className="text" onClick={() => copyToClipboard(hexToRgb(colors[indexim]))}>
                  {hexToRgb(colors[indexim])}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notification && <div className={`notification ${notification ? "show" : ""}`}>{notification}</div>}

      {showColorPicker && (
        <div style={{ position: "absolute", zIndex: 2, top: pickerPosition.top, left: pickerPosition.left }}>
          <HexColorPicker color={colors[selectedColorIndex]} onChange={handleColorChange} />
          <button className="close-picker" onClick={() => setShowColorPicker(false)}>
            <IoClose />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
