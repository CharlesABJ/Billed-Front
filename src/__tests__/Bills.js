/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import store from "../__mocks__/store.js";
import Bills from "../containers/Bills.js";

import router from "../app/Router.js";

function onNavigate() {}

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Ajout de la méthode beforeEach pourpour définir les conditions initiales avant chaque test. Cela permet d'éviter de répéter ces étapes dans chaque test individuel.
    beforeEach(() => {
      document.body.innerHTML = BillsUI({ data: bills });
      // On définit une nouvelle propriété 'localStorage' sur l'objet 'window' avec une valeur mock  pour simuler le comportement du localStorage du navigateur pendant les tests.
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

    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      // console.log(windowIcon.outerHTML);
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then if i click on mew Bill button, handleClickNewBill is called", () => {
      const billsDashboard = new Bills({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const handleClickNewBill = jest.fn(billsDashboard.handleClickNewBill);
      const newBillBtn = screen.getByTestId("btn-new-bill");
      newBillBtn.addEventListener("click", handleClickNewBill);
      newBillBtn.click();
      expect(handleClickNewBill).toBeCalled();
    });

    test("Then if I click on the eye icon, handleClickIconEye is called", () => {
      const billsDashboard = new Bills({
        document,
        onNavigate,
        store,
        localStorage,
      });
      $.fn.modal = jest.fn();
      const eyeIcon = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(
        billsDashboard.handleClickIconEye(eyeIcon)
      );
      eyeIcon.addEventListener("click", handleClickIconEye);
      eyeIcon.click();
      expect(handleClickIconEye).toBeCalled();
    });
    test("Then getBills should return an array of bills", async () => {
      const billsDashboard = new Bills({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const returnBills = await billsDashboard.getBills();
      expect(returnBills.length).toEqual(4);
    });
  });
});
