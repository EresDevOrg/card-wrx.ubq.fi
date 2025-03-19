export function newUser(): string {
  return `
    <div>
    <h2><a href="javascript:;" id="register">Get your UbiquiCard</a></h2>
    </div>
  `;
}

export function handleNewUserEvents() {
  document.getElementById("register")?.addEventListener("click", () => {
    alert("Registering new user");
  });
}
