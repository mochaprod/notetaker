import { withAuth } from "@/components/with-auth";
import { SignUpFormState } from "./components/signup-form-state";

export default withAuth(SignUpFormState, "/intake");
