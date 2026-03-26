require "test_helper"

class MyPlacesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get my_places_index_url
    assert_response :success
  end

  test "should get invite" do
    get my_places_invite_url
    assert_response :success
  end

  test "should get decline" do
    get my_places_decline_url
    assert_response :success
  end

  test "should get request_payment" do
    get my_places_request_payment_url
    assert_response :success
  end

  test "should get cancel_payment_request" do
    get my_places_cancel_payment_request_url
    assert_response :success
  end
end
