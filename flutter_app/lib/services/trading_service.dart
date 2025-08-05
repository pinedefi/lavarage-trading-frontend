import 'package:flutter/material.dart';
import 'package:web3dart/web3dart.dart';
import 'package:decimal/decimal.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class TradingService extends ChangeNotifier {
  late final String _tradingContractAddress;
  late final DeployedContract _tradingContract;
  
  bool _isLoading = false;
  List<Position> _positions = [];
  
  bool get isLoading => _isLoading;
  List<Position> get positions => _positions;
  
  TradingService() {
    _initializeContract();
  }
  
  Future<void> _initializeContract() async {
    _tradingContractAddress = dotenv.env['TRADING_CONTRACT_ADDRESS'] ?? '';
    // Contract ABI would be loaded here
    final abi = '[{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"leverage","type":"uint256"}],"name":"openLongPosition","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"leverage","type":"uint256"}],"name":"openShortPosition","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"positionId","type":"uint256"}],"name":"closePosition","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
    
    _tradingContract = DeployedContract(
      ContractAbi.fromJson(abi, 'TradingContract'),
      EthereumAddress.fromHex(_tradingContractAddress),
    );
  }
  
  Future<String> openLongPosition(
    Web3Client web3client,
    String walletAddress,
    Decimal amount,
    int leverage,
  ) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final function = _tradingContract.function('openLongPosition');
      final amountWei = BigInt.from(amount.shift(18).toInt());
      
      final transaction = Transaction.callContract(
        contract: _tradingContract,
        function: function,
        parameters: [amountWei, BigInt.from(leverage)],
        from: EthereumAddress.fromHex(walletAddress),
      );
      
      final txHash = await web3client.sendTransaction(
        EthPrivateKey.fromHex(walletAddress),
        transaction,
        chainId: null,
      );
      
      return txHash;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  Future<String> openShortPosition(
    Web3Client web3client,
    String walletAddress,
    Decimal amount,
    int leverage,
  ) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final function = _tradingContract.function('openShortPosition');
      final amountWei = BigInt.from(amount.shift(18).toInt());
      
      final transaction = Transaction.callContract(
        contract: _tradingContract,
        function: function,
        parameters: [amountWei, BigInt.from(leverage)],
        from: EthereumAddress.fromHex(walletAddress),
      );
      
      final txHash = await web3client.sendTransaction(
        EthPrivateKey.fromHex(walletAddress),
        transaction,
        chainId: null,
      );
      
      return txHash;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  Future<String> closePosition(
    Web3Client web3client,
    String walletAddress,
    BigInt positionId,
  ) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final function = _tradingContract.function('closePosition');
      
      final transaction = Transaction.callContract(
        contract: _tradingContract,
        function: function,
        parameters: [positionId],
        from: EthereumAddress.fromHex(walletAddress),
      );
      
      final txHash = await web3client.sendTransaction(
        EthPrivateKey.fromHex(walletAddress),
        transaction,
        chainId: null,
      );
      
      return txHash;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

class Position {
  final BigInt id;
  final bool isLong;
  final Decimal amount;
  final int leverage;
  final Decimal entryPrice;
  final DateTime openTime;
  
  Position({
    required this.id,
    required this.isLong,
    required this.amount,
    required this.leverage,
    required this.entryPrice,
    required this.openTime,
  });
} 