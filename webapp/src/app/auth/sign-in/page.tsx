import { withAuth } from "@/components/with-auth";
import SignInFormState from "./components/signin-form-state";

export default withAuth(SignInFormState, { redirectTo: "/intake", invert: true });
