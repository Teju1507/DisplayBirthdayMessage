const firebaseConfig = {
  apiKey: "AIzaSyAAPHKYS7oBxNfiUY6HMWTV7mUUmtw38Vs",
  authDomain: "jsandfirebaseassignment.firebaseapp.com",
  databaseURL: "https://jsandfirebaseassignment-default-rtdb.firebaseio.com",
  projectId: "jsandfirebaseassignment",
  storageBucket: "jsandfirebaseassignment.appspot.com",
  messagingSenderId: "25778004638",
  appId: "1:25778004638:web:443ca8c4fefdfcf333118f",
}

firebase.initializeApp(firebaseConfig)

const signupForm = document.getElementById("signupForm")
const loginForm = document.getElementById("loginForm")
const logoutButton = document.getElementById("logoutButton")

signupForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const username = signupForm.querySelector('input[type="text"]').value
  const dob = signupForm.querySelector('input[type="date"]').value
  const email = signupForm.querySelector('input[type="email"]').value
  const password = signupForm.querySelector('input[type="password"]').value

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid
      firebase
        .database()
        .ref("users/" + userId)
        .set({
          username: username,
          dob: dob,
          email: email,
        })
        .then(() => {
          console.log("User data saved successfully!")
          alert("signIn successful")
          showLogin()
          signupForm.reset() // Clear the signup form fields
        })
        .catch((error) => {
          console.error("Error saving user data: ", error)
          signupForm.reset() // Clear the signup form fields even on error
        })
    })
    .catch((error) => {
      console.error("Signup failed: ", error)
      signupForm.reset() // Clear the signup form fields even on error
    })
})

loginForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const email = loginForm.querySelector('input[type="email"]').value
  const password = loginForm.querySelector('input[type="password"]').value

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log("User signed in successfully.")
      fetchData()
      loginForm.reset() // Clear the login form fields
    })
    .catch((error) => {
      console.error("Login failed: ", error)
      if (error.message.includes("auth/invalid-login-credentials")) {
        alert("Password is wrong")
      }
      loginForm.reset() // Clear the login form fields even on error
    })
})

logoutButton.addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      document.getElementById("birthdayMessageContainer").style.display = "none"
      document.getElementById("signup").style.display = "block"
      document.getElementById("login").style.display = "none"
      console.log("User signed out successfully.")
    })
    .catch((error) => {
      console.error("Error signing out: ", error)
    })
})

async function fetchData() {
  try {
    console.log("Fetching quotes...")
    const response = await fetch("https://type.fit/api/quotes")
    if (!response.ok) {
      throw new Error("Could not fetch data")
    }
    const data = await response.json()
    console.log("Quotes fetched successfully.")

    const user = firebase.auth().currentUser
    if (user) {
      console.log("User is signed in, fetching user data...")
      displayBirthdayMessage(data, user.uid)
    } else {
      console.log("No user is signed in.")
    }
  } catch (error) {
    console.error(error)
  }
}

function displayBirthdayMessage(quotes, userId) {
  firebase
    .database()
    .ref("users/" + userId)
    .once("value")
    .then((snapshot) => {
      const userData = snapshot.val()
      const username = userData.username.toUpperCase()
      const parts = userData.dob.split("-")
      const birthdayDate = new Date(parts[0], parts[1] - 1, parts[2]) // Month is 0-indexed
      const today = new Date()

      console.log(`User data: ${JSON.stringify(userData)}`)

      if (today.getMonth() == parts[1] - 1 && today.getDate() == parts[2]) {
        const randomIndex = Math.floor(Math.random() * quotes.length)
        const randomQuote = quotes[randomIndex].text.toUpperCase()
        console.log(`Random quote: ${randomQuote}`)

        document.getElementById("signup").style.display = "none"
        document.getElementById("login").style.display = "none"
        document.getElementById("birthdayMessageContainer").style.display =
          "flex"
        document.getElementById(
          "birthdayMessage"
        ).innerHTML = `<strong><span style="font-size: 33px; color: #00e5ff">
        Happy Birthday, ${username}!</span></strong> Here's a quote for you: "${randomQuote}"`
      } else {
        const nextBirthday = new Date(
          today.getFullYear(),
          birthdayDate.getMonth(),
          birthdayDate.getDate()
        )

        if (today > nextBirthday) {
          nextBirthday.setFullYear(today.getFullYear() + 1)
        }
        const daysUntilBirthday = Math.ceil(
          (nextBirthday - today) / (1000 * 60 * 60 * 24)
        )

        console.log(`Days until next birthday: ${daysUntilBirthday}`)

        document.getElementById("signup").style.display = "none"
        document.getElementById("login").style.display = "none"
        document.getElementById("birthdayMessageContainer").style.display =
          "flex"
        document.getElementById(
          "birthdayMessage"
        ).innerHTML = `There are <strong><span style="font-size: 33px; color: #00e5ff">
        ${daysUntilBirthday}</span></strong> days until your next birthday, ${username}!`
      }
    })
    .catch((error) => {
      console.error("Error fetching user data: ", error)
    })
}

function showLogin() {
  document.getElementById("signup").style.display = "none"
  document.getElementById("login").style.display = "block"
  document.getElementById("birthdayMessageContainer").style.display = "none"
}

function showSignup() {
  document.getElementById("login").style.display = "none"
  document.getElementById("signup").style.display = "block"
  document.getElementById("birthdayMessageContainer").style.display = "none"
}
