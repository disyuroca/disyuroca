document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            const form = event.target;
            const submitBtn = document.getElementById('submitBtn');
            
            submitBtn.value = "Enviando...";
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const formObject = Object.fromEntries(formData);

            fetch("https://formsubmit.co/ajax/disyuroca@hotmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formObject)
            })
            .then(response => response.json())
            .then(data => {
                alert("¡Solicitud enviada correctamente! Nos pondremos en contacto contigo a la brevedad.");
                form.reset();
            })
            .catch(error => {
                alert("Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo.");
                console.error("Error al enviar:", error);
            })
            .finally(() => {
                submitBtn.value = "Enviar Solicitud por Correo";
                submitBtn.disabled = false;
            });
        });
    }
});
