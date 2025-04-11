# Identity System

**⚠️ This project is currently under active development. Expect frequent updates and changes.**

The Identity System is a user-friendly React-based frontend designed to support the first phase of the AI-powered exam monitoring system. This component focuses on verifying student or individual identities by comparing live images with a stored database of registered individuals.

---

## Features

- **Student Identity Verification:** Matches a student's live image with a registered image stored in the database.
- **User-Friendly Interface:** Provides a simple and intuitive UI for users to capture live images or upload existing files.
- **Error Handling:** Displays specific error messages when issues arise, such as "No face detected in the image."
- **Data Interaction:** Supports efficient communication with the backend for image processing and comparison.

---

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/radanpro/identity.git
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd identity/frontend
   ```

3. **Install Dependencies:**

   ```bash
   npm install
   ```

---

## Usage

1. **Run the Application:**

   ```bash
   npm run dev
   ```

   This will start the React development server on `http://localhost:3000`.

2. **Access the Application:**

   Open your browser and go to `http://localhost:3000` to use the identity verification interface.

   - Capture or upload a student's image.
   - Submit the image for verification.
   - View results indicating whether the individual matches the registered record.

---

## Development Steps

1. **Step 1:** Implement image upload and live capture functionalities.
2. **Step 2:** Integrate the frontend with the backend for identity comparison.
3. **Step 3:** Display comparison results with success or error messages.
4. **Step 4:** Enhance UI for a better user experience.

---

## Error Handling and Feedback

- The application provides real-time error messages such as:
  - "No face detected in the image"
  - "Image upload failed"
- Users receive these alerts through a clean and interactive UI.

### Example:

If no face is detected in the image, the application displays:

```plaintext
Error: No face detected in the image
```

---

## Future Improvements

- Integrate advanced face detection techniques for better accuracy.
- Support additional biometric methods.
- Optimize performance for large datasets.
- Improve error handling with more descriptive feedback.

---

## Contributing

We welcome contributions to enhance the project! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:

   ```bash
   git checkout -b feature-branch
   ```

3. Make your changes.
4. Commit your changes with a descriptive message:

   ```bash
   git commit -m "Add new feature"
   ```

5. Push to the branch you created:

   ```bash
   git push origin feature-branch
   ```

6. Create a new Pull Request:
   - Go to your forked repository on GitHub.
   - Click on the "Pull Requests" tab.
   - Click on the "New Pull Request" button.
   - Select your branch from the dropdown and create the pull request, adding any relevant comments.

---

## .gitignore

To maintain a clean and organized repository, the following items are included in the `.gitignore` file:

- Node.js dependencies (`node_modules`)
- Environment variable files
- Build files (`build/`)
- Logs and debugging files

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
