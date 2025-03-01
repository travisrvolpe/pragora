# diagnostic_tool.py
# Run this script with python diagnostic_tool.py

import requests
import sys
import time
import json

BASE_URL = "http://localhost:8000"  # Change if your backend is on a different URL
FRONTEND_URL = "http://localhost:3000"  # Change if your frontend is on a different URL


def print_title(title):
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80)


def print_section(title):
    print("\n" + "-" * 80)
    print(f" {title} ".center(80, "-"))
    print("-" * 80)


def print_error(message):
    print(f"\n❌ ERROR: {message}")


def print_success(message):
    print(f"\n✅ SUCCESS: {message}")


def print_warning(message):
    print(f"\n⚠️ WARNING: {message}")


def print_info(message):
    print(f"\n📝 INFO: {message}")


def pretty_print(obj):
    print(json.dumps(obj, indent=2))


def get_auth_token():
    # You'll need to input your credentials
    email = input("Enter your email: ")
    password = input("Enter your password: ")

    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        token = response.json().get("access_token")
        if token:
            print_success("Authentication successful")
            return token
        else:
            print_error("No token received")
            return None
    except Exception as e:
        print_error(f"Authentication failed: {str(e)}")
        return None


def check_cors_setup():
    print_section("CORS Setup Check")
    try:
        response = requests.options(
            f"{BASE_URL}/posts/1",
            headers={
                "Origin": FRONTEND_URL,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization"
            }
        )

        print(f"Status code: {response.status_code}")
        print("Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")

        # Check CORS headers
        if "Access-Control-Allow-Origin" in response.headers:
            if response.headers["Access-Control-Allow-Origin"] == FRONTEND_URL:
                print_success("CORS Origin header is correctly set")
            else:
                print_warning(
                    f"CORS Origin header is set to {response.headers['Access-Control-Allow-Origin']}, expected {FRONTEND_URL}")
        else:
            print_error("CORS Origin header is missing")

        if "Access-Control-Allow-Methods" in response.headers:
            methods = response.headers["Access-Control-Allow-Methods"].split(", ")
            if "GET" in methods and "POST" in methods and "OPTIONS" in methods:
                print_success("CORS Methods header includes required methods")
            else:
                print_warning(f"CORS Methods header might be missing required methods: {methods}")
        else:
            print_error("CORS Methods header is missing")

        if "Access-Control-Allow-Headers" in response.headers:
            headers = response.headers["Access-Control-Allow-Headers"].split(", ")
            if "Authorization" in headers or "*" in headers:
                print_success("CORS Headers header includes Authorization")
            else:
                print_warning(f"CORS Headers header might be missing Authorization: {headers}")
        else:
            print_error("CORS Headers header is missing")

    except Exception as e:
        print_error(f"CORS check failed: {str(e)}")


def check_post_retrieval(post_id, token=None):
    print_section(f"Post Retrieval Check (Post {post_id})")
    try:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        response = requests.get(
            f"{BASE_URL}/posts/{post_id}",
            headers=headers
        )

        print(f"Status code: {response.status_code}")

        if response.status_code == 200:
            print_success("Post retrieved successfully")
            data = response.json()
            post = data.get("data", {}).get("post", {})

            print_info("Post Metrics:")
            metrics = post.get("metrics", {})
            pretty_print(metrics)

            print_info("Post Interaction State:")
            interaction_state = post.get("interaction_state", {})
            pretty_print(interaction_state)

            return post
        else:
            print_error(f"Failed to retrieve post: {response.text}")
            return None
    except Exception as e:
        print_error(f"Post retrieval failed: {str(e)}")
        return None


def check_save_functionality(post_id, token):
    print_section(f"Save Functionality Check (Post {post_id})")
    if not token:
        print_error("No auth token available")
        return

    try:
        # First get current state
        post = check_post_retrieval(post_id, token)
        if not post:
            print_error("Couldn't retrieve post to check save state")
            return

        is_saved = post.get("interaction_state", {}).get("save", False)
        print_info(f"Current save state: {'Saved' if is_saved else 'Not Saved'}")

        # Now toggle save state
        print_info(f"Attempting to {'unsave' if is_saved else 'save'} post...")
        response = requests.post(
            f"{BASE_URL}/posts/engagement/{post_id}/save",
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"Status code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            new_state = data.get("save", False)
            save_count = data.get("save_count", 0)

            print_info(f"Save API response:")
            pretty_print(data)

            if new_state != is_saved:
                print_success(f"Save state toggled successfully: {is_saved} -> {new_state}")
            else:
                print_warning(f"Save state didn't change: {is_saved} -> {new_state}")

            # Check if save_count makes sense
            if new_state and save_count == 0:
                print_error("Save count is 0 but state is saved!")
            elif not new_state and save_count > 0:
                print_warning(f"Save count is {save_count} but state is not saved")

            # Verify state after save operation
            time.sleep(1)  # Give the backend a moment to update
            updated_post = check_post_retrieval(post_id, token)
            if updated_post:
                updated_save_state = updated_post.get("interaction_state", {}).get("save", False)
                if updated_save_state == new_state:
                    print_success("Post retrieval shows correct save state after operation")
                else:
                    print_error(
                        f"State inconsistency: API returned {new_state} but get_post shows {updated_save_state}")
        else:
            print_error(f"Save operation failed: {response.text}")
    except Exception as e:
        print_error(f"Save functionality check failed: {str(e)}")


def check_debug_endpoints(post_id, token):
    print_section(f"Debug Endpoints Check (Post {post_id})")
    if not token:
        print_error("No auth token available")
        return

    try:
        # Check debug endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/posts/{post_id}/debug",
            headers=headers
        )

        if response.status_code == 200:
            print_success("Debug endpoint accessible")
            data = response.json()

            print_info("Debug data:")
            pretty_print(data)

            # Check for discrepancies
            discrepancies = data.get("discrepancies", {})
            if any(discrepancies.values()):
                print_warning("Found count discrepancies between DB and cache:")
                pretty_print(discrepancies)
            else:
                print_success("No count discrepancies found")

            # Check saved_posts vs interaction consistency
            if token:
                user_interactions = data.get("user_interactions", {})
                has_save_interaction = any(
                    interaction.get("type") == "save"
                    for interaction in user_interactions.get("interactions", [])
                )
                is_in_saved_posts = user_interactions.get("in_saved_posts", False)

                if has_save_interaction != is_in_saved_posts:
                    print_error(
                        f"Save state inconsistency: In interactions: {has_save_interaction}, In saved_posts: {is_in_saved_posts}")

                    # Try to repair the inconsistency
                    print_info("Attempting to repair save state...")
                    repair_response = requests.post(
                        f"{BASE_URL}/posts/{post_id}/repair-save-state",
                        headers=headers
                    )

                    if repair_response.status_code == 200:
                        repair_data = repair_response.json()
                        print_info("Repair response:")
                        pretty_print(repair_data)

                        if repair_data.get("was_inconsistent", False):
                            print_success("Inconsistency was detected and repaired")
                        else:
                            print_warning("No inconsistency was detected by the repair endpoint")
                    else:
                        print_error(f"Repair operation failed: {repair_response.text}")
                else:
                    print_success("Save state is consistent between interactions and saved_posts")
        else:
            print_error(f"Debug endpoint failed: {response.text}")
    except Exception as e:
        print_error(f"Debug endpoints check failed: {str(e)}")


def run_diagnostics():
    print_title("Post Engagement Diagnostics Tool")

    post_id = input("Enter the post ID to diagnose: ")
    try:
        post_id = int(post_id)
    except ValueError:
        print_error("Invalid post ID")
        return

    print_info("Checking CORS setup...")
    check_cors_setup()

    print_info("Checking unauthenticated post retrieval...")
    check_post_retrieval(post_id)

    print_info("Checking authenticated functionality...")
    token = get_auth_token()
    if token:
        check_post_retrieval(post_id, token)
        check_save_functionality(post_id, token)
        check_debug_endpoints(post_id, token)

    print_title("Diagnostics Complete")
    print_info("Check the output above for any errors or warnings.")


if __name__ == "__main__":
    run_diagnostics()


#python app/diagnostic_tool.py