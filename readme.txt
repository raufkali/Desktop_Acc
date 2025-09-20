create this using Electron + Node + mongodb + react

User can Login
User can create Transaction
User can keep track of accounts he did transactions from
User can have their journal
User can have their ledger
User can keep track of their debitors and creditors

Login: 
username, email, password -> Registration
username and password -> Login

Transactions:
(1) Send: send directly, or send on behalf of somenoe
(2) receive: receive from someone
note: keep track of every transaction in a sequence starting from 1

Accounts:
createAccount: accountName, balance;

journal:
get all transactions related to login user

Ledger:
keep track of accounts, their deductions and additions, debitors and creditors, whom to pay and whom to pay me

daily Summary on dashboard
option for monthly summary
option for yearly summary

partners section:
createPartner: partnerName, phone

example transaction:
ali create account and login
i create 10 transactions on behalf of partner Ahmad
example of transaction be like:
type: Send
senderName: default the login user name no need to take as input
receiverName: abdullah
quantity, rate, amount: calculate from quantity and rate || can be manually inserted
account: fetch all the accounts and select from it such as Bank, personal etc
date: default today
onBehalOf: Ahmad
make sure every name is .toLowerCase()

you send 10 transactions like this on behalf of ahmad,
so you don't need to keep the reciever your creditors but the ahmad
ahmad now owes you that amount you have send in total
now ahmad send you back more then total amount or less or equal
if is more, make sure to make him debitor and on his account make yourself  creditor
in contrast if was less he is still your creditor.
make sure to use I need to Pay, and Pay to me instead of creditors and debitors in frontend
in dashboard you will keep track of how much amount have you send, and how much have you recieved
along with who you needs to pay and who needs to pay you
also there will be option for daily to select date and see how much you have send and receive on that day
just like that monthly and yearly

in all the schemas make sure set the Id to string cuz i face error when its by default an object
you can add features that i have forget.

use dashboard like sidebar containing all the links
use bootstrap
use downloaded version of fontawesome
use Oswald font from googlefonts for headings stups
make sure use black and white theme, simple design classic formal
use shadows in cards or background lights for better theme effect

partner can be many

my overAll goal is:
i have partners they send me list so i send money to them and i keep the partner my creditor the one who needs to pay me
then he send me all the money at once may be more or less so at the end of the day i keep track of which transactions have i did
on behalf of whom so on the summary you need to make sure that onbehalf of every transaction is in a sperate section or if its exportable
to pdf or something would be awesome like if i need to export transactions on behalf of ali on today date do this workable and calculate the total at
the end the total i have send
the total ali has send me in the bottom
and then differnce of them



