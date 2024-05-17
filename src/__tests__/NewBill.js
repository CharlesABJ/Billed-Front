/**
 * @jest-environment jsdom
 */

import { ROUTES } from "../constants/routes.js";
import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { fireEvent } from "@testing-library/dom";
import store from "../__mocks__/store.js";

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
    });
    test("Then I should have the title", () => {
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });

    test("Then I change the file", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["test.png"], "test.png", { type: "image/png" })],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
    });

    test("Then I submit the form", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
    });

    test("Then I fill the form and submit it, I should be redirected to dashboard", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);

      // Fill the form
      const fileInput = screen.getByTestId("file");

      await fireEvent.change(fileInput, {
        target: {
          files: [new File(["test.png"], "test.png", { type: "image/png" })],
        },
      });
      const expenseTypeInput = screen.getByTestId("expense-type");
      fireEvent.change(expenseTypeInput, { target: { value: "Transports" } });

      const expenseNameInput = screen.getByTestId("expense-name");
      fireEvent.change(expenseNameInput, { target: { value: "test" } });

      const dateInput = screen.getByTestId("datepicker");
      fireEvent.change(dateInput, { target: { value: "2021-09-01" } });

      const amountInput = screen.getByTestId("amount");
      fireEvent.change(amountInput, { target: { value: "test" } });

      const vatInput = screen.getByTestId("vat");
      fireEvent.change(vatInput, { target: { value: "test" } });

      const pctInput = screen.getByTestId("pct");
      fireEvent.change(pctInput, { target: { value: "test" } });

      const commentaryInput = screen.getByTestId("commentary");
      fireEvent.change(commentaryInput, { target: { value: "test" } });

      const submitButton = screen.getByText("Envoyer");
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();

      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });
});
