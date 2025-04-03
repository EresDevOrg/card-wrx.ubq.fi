import { getCardImage } from "./card-svg";

export function createHomePage(): string {
  return `
     <div class="demo-card">
      <div>
        ${getCardImage()}  
        <h4>Seamless. Secure. Ubiquitous.</h4>
      </div>
    </div>
  `;
}
