const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput = document.querySelector("#fileInput");

const host = "https://docsend-esw.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;


const sharingContainer = document.querySelector(".sharing-container")

const emailForm =  document.querySelector("#emailForm")

//animation
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent")
const progressBar = document.querySelector(".progress-bar")
const progressContainer = document.querySelector(".progress-container");

const fileURLInput = document.querySelector("#fileURL");

const copyBtn = document.querySelector("#copyBtn");

const popUpCopy = document.querySelector(".popUpCopy");


const maxAllowed = 100 * 1024 * 1024; 
//
dropZone.addEventListener("dragover", (e) => {
     e.preventDefault();

     if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
     }
    
});


dropZone.addEventListener("dragleave", () =>{
   dropZone.classList.remove("dragged");

   console.log("drag ended");
})

dropZone.addEventListener("drop", (e) =>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    console.table(files);
    if(files.length){
        fileInput.files = files;
        uploadFile();
    }
 });

 fileInput.addEventListener("change", () => {
     uploadFile();
 })

 browseBtn.addEventListener("click", () => {
     fileInput.click();
 })

 

 copyBtn.addEventListener("click", () => {
        fileURLInput.select();
        document.execCommand("copy");
        showPopUp("Copied To Clipboard")
        
 })

 const uploadFile = () => {
    
    
    if(fileInput.files.length > 2) {
        resetFileInput()
        showPopUp("Upload Only Two File At Once!")
        return ;
    }
    
    const file = fileInput.files[0];
    if(file.size > maxAllowed ){
           showPopUp("You Can't Upload More Than 100MB..")
           resetFileInput();
           return;
    }
    

    
    progressContainer.style.display = "block"



     let files = fileInput.files; 
     const formData = new FormData();
     formData.append("myfile", files[0]);

     const xhr = new XMLHttpRequest();


  // 
     xhr.onreadystatechange = () => {
        
         if(xhr.readyState == XMLHttpRequest.DONE) {
            //  onFileUploadSuccess(xhr.responseText);
            console.log(xhr.responseText);
            onUploadSuccess(JSON.parse(xhr.responseText));
         }
     };

     xhr.upload.onprogress = updateProgress;

     xhr.upload.onerror = () => {
        resetFileInput()
        showPopUp(`Error in upload: ${xhr.statusText}`);
     }

xhr.open("POST", uploadURL);
xhr.send(formData);
};

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    // console.log(percent);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText = `${percent}`;
    progressBar.style.transform = `scaleX(${percent/100})`;
};


const onUploadSuccess = ( { file: url } ) => {
    console.log(url);
    emailForm[2].removeAttribute("disabled", "true");
    fileInput.value = "";
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";

    fileURLInput.value = url;
}


const resetFileInput = () => {
    fileInput.value="";
}


emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Submit form");

    const url = fileURLInput.value;
    
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    };

    emailForm[2].setAttribute("disabled", "true");
    console.table(formData);

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then(res => res.json()).then(({ success }) => {
        if(success) {
           sharingContainer.style.display = "none";
           showPopUp("Email Sent Successfully...")
    }  
        
    });

});

let setTimer;
const showPopUp = (msg) => {
    popUpCopy.innerText = msg;
    popUpCopy.style.transform = "translate(0%, -500%)";
    clearTimeout(popUpCopy);
    setTimer = setTimeout( () => {
    popUpCopy.style.transform = "translate(-150%, -500%)";

    }, 2000);
} 