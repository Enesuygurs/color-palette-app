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
    // LocalStorage'daki mevcut kaydedilen renkleri al
    const savedColors = checkLocalStorage();

    // Eğer kaydedilmiş renk sayısı 6 veya daha fazlaysa, kaydetme işlemini durdur.
    if (savedColors.length >= 6) {
      setNotification(`You can save a maximum of 6 colors.`);
      setTimeout(() => {
        setNotification("");
      }, 3000);
      return;
    }

    // Renk zaten kaydedilmiş mi kontrol et
    const colorObject = savedColors.find((savedColor) => savedColor.id === index + 1);

    if (colorObject) {
      // Eğer renk zaten kaydedilmişse, güncelle
      colorObject.color = color;
    } else {
      // Yeni bir renkse, kaydedilen renkler listesine ekle
      savedColors.push({
        id: index + 1,
        color: color,
      });
    }

    // Güncellenen renkleri localStorage'a kaydet
    localStorage.setItem("savedColors", JSON.stringify(savedColors));

    // Kullanıcıya bildirim göster ve UI'ı güncelle
    setNotification(`Color saved.`);
    setTimeout(() => {
      setNotification("");
    }, 3000);

    // Ekranı güncellemek için durumu güncelle
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
  const [forceUpdate] = useState(0);

  const removeSection = (index) => {
    if (colors.length === 1) {
      setNotification(`This is the last color, it cannot be removed.`);
      setTimeout(() => {
        setNotification("");
      }, 3000);
      return;
    }

    // Yeni renkler listesini oluşturuyoruz
    const newColors = colors.filter((_, idx) => idx !== index);

    // Kaydedilmiş renkleri de güncellemek gerekiyor
    let savedColors = checkLocalStorage();
    savedColors = savedColors.filter((color) => color.id !== index + 1);

    // Güncellenen renkleri localStorage'a kaydediyoruz
    localStorage.setItem("savedColors", JSON.stringify(savedColors));

    setColors(newColors); // State güncelleniyor
    setNotification(`Color removed.`);
    setTimeout(() => {
      setNotification("");
    }, 3000);
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
            key={`${color}-${indexim}-${forceUpdate}`} // key'i de forceUpdate'e bağlı yaparak render tetiklenmesini sağlayabiliriz
            className="section"
            style={{ backgroundColor: color }}
          >
            <div className="parts">
              <div className="mybuttons">
                {indexim < 6 && // Eğer 7. veya 8. renkse kilit simgelerini gösterme
                  (checkColorIsSaved(indexim) ? (
                    <div className="buttons" onClick={() => removeSavedColor(indexim)}>
                      <FaUnlock />
                    </div>
                  ) : (
                    <div className="buttons" onClick={() => saveColor(indexim, color)}>
                      <FaLock />
                    </div>
                  ))}
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
