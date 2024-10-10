const template = `
<style>body { color: red !important; }</style>
<h2>Lorem ipsum</h2>
<div class="text">Javascript color: green</div>
<script>
  document.querySelector('.text').style.color = 'green';
</script>
`;
const wrapper = document.querySelector(".wrapper");
wrapper?.insertAdjacentHTML("beforeend", template);

const scriptContent = wrapper?.querySelector("script");
if (scriptContent) {
  eval(scriptContent.innerHTML); // Execute the script's content
}
