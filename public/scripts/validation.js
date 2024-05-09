/* eslint-disable @typescript-eslint/no-unused-vars */
const domain = "http://localhost:8000";
const { token } = getQueryParams();
var tokenData = {};

const successPageContent = `
    <h1>Enter your new credentials</h1>
    <form id="new-pass-form" onsubmit="handleSubmit(event)">
        <label for="newPass">New Password:</label><br />
        <div id="input-container">
            <input
                type="password"
                id="newPass"
                name="newPass"
                placeholder="****"
                required
                oninput="validatePassword()"
            />
            <button id="show-hide" type="button" onclick="togglePasswordVisibility()">Show/Hide</button>
        </div>
        <br />

        <label for="repNewPass">Repeat New Password:</label><br />
        <input
            type="password"
            id="repNewPass"
            name="repNewPass"
            placeholder="****"
            required
        /><br />

        <span id="passwordError" style="color: red;"></span>
        <br /><br />

        <input id="submit-button" type="submit" value="Submit" />
    </form>
`;

const resetPassPageContent = `
    <h1>Password has been changed! .. you can leave this page now.</h1>
`;

function getQueryParams() {
    const queryParams = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split("&");
    pairs.forEach((stringPair) => {
        const pair = stringPair.split("=");
        if (pair.length === 2) {
            queryParams[pair[0]] = decodeURIComponent(pair[1]);
        }
    });
    return queryParams;
}

function validatePassword() {
    const password = document.getElementById("newPass").value;
    const passwordError = document.getElementById("passwordError");

    if (password.length < 8) {
        passwordError.textContent =
            "Password must be at least 8 characters long.";
        return;
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!regex.test(password)) {
        passwordError.textContent =
            "Password must contain at least one small letter, one capital letter, and one number";
        return;
    }

    passwordError.textContent = "";
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById("newPass");
    const button = document.getElementById("show-hide");

    if (passwordInput.type === "password") {
        button.style.backgroundColor = "white";
        button.style.color = "#fc5f48";
        button.style.borderColor = "#fc5f48";
        passwordInput.type = "text";
    } else {
        button.style.backgroundColor = "#fc5f48";
        button.style.color = "white";
        button.style.borderColor = "white";
        passwordInput.type = "password";
    }
}

function handleSubmit(event) {
    event.preventDefault();
    try {
        const newPass = document.getElementById("newPass").value;
        const repNewPass = document.getElementById("repNewPass").value;

        if (newPass === repNewPass && newPass !== "") {
            fetch(
                `${domain}/auth/passwordReset?identifier=${tokenData?.email}&newPassword=${newPass}&token=${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
                .then((res) => {
                    return res.json();
                })
                .then((res) => {
                    if (res.status === 201) {
                        document.getElementById("root-div").innerHTML =
                            resetPassPageContent;
                    } else {
                        console.log(res);
                        document.getElementById("root-div").innerHTML =
                            "<h1>Server error occurred!</h1>";
                    }
                });
        } else {
            document.getElementById("passwordError").textContent =
                "Passwords do not match.";
        }
    } catch (error) {
        console.log(error.message);
    }
}

function main() {
    fetch(domain + "/auth/validate/" + token)
        .then((res) => {
            if (!res.ok) {
                document.getElementById("root-div").innerHTML =
                    "<h1>Invalid Entrance</h1>";
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            document.getElementById("root-div").innerHTML = successPageContent;
            tokenData = data.data;
        });
}

main();
