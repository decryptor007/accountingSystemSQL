var models=require("../models");
var receiveReceipt=models.receiveReceipt;
var paymentReceipt=models.paymentReceipt;


async function getCashAccountBalance(cashAccount){
  let cashAccountObj=await models.account.findOne({where:{id:cashAccount}});
  if(cashAccountObj){
    let receiveReceiptRaws=await receiveReceipt.findAll({where:{cashAccount:cashAccount}});
    let paymentReceiptRaws=await paymentReceipt.findAll({where:{cashAccount:cashAccount}});
    var accExchangeRate=cashAccountObj.exchangeRate;
    var debit=cashAccountObj.debit*accExchangeRate;
    var credit=cashAccountObj.credit*accExchangeRate;

    // summing up receiveReceipts
    for(var i=0;i<receiveReceiptRaws.length;i++){
      var receiptAmount=receiveReceiptRaws[i].amount*receiveReceiptRaws[i].exchangeRate;
      debit+=receiptAmount;
    }

    // summing up paymentReceipts
    for(var i=0;i<paymentReceiptRaws.length;i++){
      var receiptAmount=paymentReceiptRaws[i].amount*paymentReceiptRaws[i].exchangeRate;
      credit+=receiptAmount;
    }

    var accBalance={debit:debit,credit:credit};
    return accBalance;
  }
  else{
    return Promise.reject("There's no such cash account!");
  }
}
module.exports={
  isValidInsert:async function(cashAccount,newReceipt){
      let accBalance=await getCashAccountBalance(cashAccount);
      let receiptAmountCredit=newReceipt.amount*newReceipt.exchangeRate;
      console.log(accBalance);
      if(accBalance.debit<accBalance.credit+receiptAmountCredit){
        return false;
      }
      else{return true;}
  },
  isValidUpdate:async function(cashAccount,newReceipt,receiptId,type){
    let oldReceipt=await paymentReceipt.findOne({where:{id:receiptId}});
    if(oldReceipt){
      let accBalance=await getCashAccountBalance(cashAccount);
      let newReceiptAmountCredit=newReceipt.amount*newReceipt.exchangeRate;
      let oldReceiptAmountCredit=oldReceipt.amount*oldReceipt.exchangeRate;
      if(accBalance.debit<accBalance.credit+newReceiptAmountCredit-oldReceiptAmountCredit){
        return false;
      }
      else{return true;}
    }
    else{
      return false;
    }
}
}
