document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('syndicateToken'); // Get the syndicate token

  if (token) {
      fetchSyndicateDetails(token);
      fetchSyndicateClients(token);
  } else {
      console.error('Token not found in local storage.');
  }


async function fetchSyndicateDetails(token) {
  try {
      const response = await fetch('/api/syndicate-details', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (response.ok) {
          const syndicateUser = await response.json();
          displaySyndicateDetails(syndicateUser);
      } else {
          console.error('Error fetching syndicate details:', await response.text());
      }
  } catch (error) {
      console.error('Error fetching syndicate details:', error);
  }
}

function displaySyndicateDetails(user) {
  const profileCard = document.getElementById('profile-card');
  if (profileCard) {
      profileCard.innerHTML = `
          <div class="flex items-center">
              <div>
                  <p class="text-lg font-bold">Strategy Partner: ${user.syndicate_name}</p>
                  <p class="text-sm">User ID: ${user.user_id}</p>
                  <p class="text-sm">Department: ${user.department}</p>
              </div>
          </div>
      `;
  } else {
      console.error('Profile card element not found.');
  }
}

async function fetchSyndicateClients(token) {
  try {
      const response = await fetch('/api/syndicateclients', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (response.ok) {
          const syndicateClients = await response.json();
          populateTable(syndicateClients);
      } else {
          console.error('Error fetching syndicate clients:', await response.text());
      }
  } catch (error) {
      console.error('Error fetching syndicate clients:', error);
  }
}

function populateTable(clients) {
    const tableBody = document.getElementById('client-table-body');
    tableBody.innerHTML = ''; // Clear existing table rows
  
    clients.forEach((client) => {
        // Use the client.faceImage or a placeholder if it doesn't exist
        const profileImage = client.faceImage ? `/images/${client.faceImage}` : 'https://via.placeholder.com/80';
  
        const row = `
            <tr>
              <td class="py-2 px-4">
                  <img id="profile-img" src="${profileImage}" alt="Profile" class="profile-img cursor-pointer" style="width: 50px; height: 50px; border-radius: 50%;" onclick="openImagePopup('${profileImage}')">
              </td>
              <td class="py-2 px-4">${client.name || 'N/A'}</td>
              <td class="py-2 px-4">${new Date(client.createdAt).toLocaleString()}</td>
              <td class="py-2 px-4">
                  <button class="bg-blue-500 px-2 py-1 rounded" onclick="handleViewClient('${client._id}')">View</button>
              </td>
              <td class="py-2 px-4">
                  <button onclick="handleAddDetailsClick(event, '${client._id}')" class="bg-green-500 px-2 py-1 rounded">Add</button>
              </td>
              <td class="py-2 px-4">
                  <button href="./mom.html" onclick="handleAddDetailsClick1(event, '${client._id}')" class="bg-green-500 px-2 py-1 rounded">Log</button>
              </td>
              <!-- Priority Flag Column -->
              <td class="py-2 px-4">
                  <select id="priority-${client._id}" class="priority-select" onchange="updatePriorityColor('${client._id}')">
                      <option value="low" ${client.priority === 'low' ? 'selected' : ''}>Low</option>
                      <option value="medium" ${client.priority === 'medium' ? 'selected' : ''}>Medium</option>
                      <option value="high" ${client.priority === 'high' ? 'selected' : ''}>High</option>
                  </select>
              </td>
              <td class="py-2 px-4">
                  <button class="bg-green-500 px-2 py-1 rounded" onclick="handleSavePriority('${client._id}')">Save</button>
              </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
  }
  
  // Function to open the image popup with the clicked image
function openImagePopup(imageUrl) {
    const imagePopup = document.getElementById('imagePopup');
    const popupImage = document.getElementById('popupImage');

    // Set the image URL in the popup
    popupImage.src = imageUrl;

    // Show the popup
    imagePopup.classList.remove('hidden');
}

// Make the function available globally
window.openImagePopup = openImagePopup;

// Event listener to close the popup when the "X" button is clicked
document.getElementById('closePopup').addEventListener('click', () => {
    const imagePopup = document.getElementById('imagePopup');
    imagePopup.classList.add('hidden'); // Hide the popup
});


// Assign handleViewClient to window object to ensure it is globally accessible
window.handleViewClient = function (clientId) {
    localStorage.setItem('clientId', clientId); // Store the clientId in localStorage
    window.location.href = './syndicate_client_side_customerview.html'; // Redirect to the client view page
};

// Function to handle adding details
window.handleAddDetailsClick = function (event, clientId) {
    event.preventDefault(); // Prevent default anchor behavior
    localStorage.setItem('clientId', clientId); // Store the clientId in localStorage
    window.location.href = './syndicate_client_data_entry.html'; // Redirect to the data entry page
};

window.handleAddDetailsClick1 = function (event, clientId) {
    event.preventDefault(); // Prevent default anchor behavior
    localStorage.setItem('clientId', clientId); // Store the clientId in localStorage
    window.location.href = './mom.html'; // Redirect to the data entry page
};


function storeClientId(clientId) {
    localStorage.setItem('clientId', clientId); // Store clientId in localStorage
}

function showClientDetails(clientId) {
  console.log('Client ID:', clientId); // You can implement more details here
}
// Function to update the priority color dynamically
window.updatePriorityColor = function(clientId) {
    const selectElement = document.getElementById(`priority-${clientId}`);
    const selectedPriority = selectElement.value;

    // Update background color based on selected priority
    if (selectedPriority === 'high') {
        selectElement.style.backgroundColor = '#FF6347'; // Red for high priority
    } else if (selectedPriority === 'medium') {
        selectElement.style.backgroundColor = '#FFD700'; // Yellow for medium priority
    } else {
        selectElement.style.backgroundColor = '#90EE90'; // Green for low priority
    }
};

// Function to handle saving the updated priority
window.handleSavePriority = async function(clientId) {
    const selectElement = document.getElementById(`priority-${clientId}`);
    const newPriority = selectElement.value;

    try {
        const response = await fetch(`/api/syndicateclients/${clientId}/priority`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`
            },
            body: JSON.stringify({ priority: newPriority })
        });

        if (response.ok) {
            alert('Priority updated successfully');
        } else {
            const errorData = await response.json();
            console.error('Error updating priority:', errorData.message);
            alert('Error updating priority. Please try again.');
        }
    } catch (error) {
        console.error('Error updating priority:', error);
        alert('Error updating priority. Please try again.');
    }
};
});