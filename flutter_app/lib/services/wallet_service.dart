import 'package:flutter/material.dart';
import 'package:dynamic_sdk/dynamic_sdk.dart';
import 'package:web3dart/web3dart.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class WalletService extends ChangeNotifier {
  bool _isConnected = false;
  String _address = '';
  late Web3Client _web3client;
  
  bool get isConnected => _isConnected;
  String get address => _address;
  Web3Client get web3client => _web3client;

  WalletService() {
    _initializeWeb3();
  }

  void _initializeWeb3() {
    final rpcUrl = dotenv.env['RPC_URL'] ?? 'https://eth-mainnet.g.alchemy.com/v2/your-api-key';
    _web3client = Web3Client(rpcUrl, http.Client());
  }

  Future<void> connectWallet() async {
    try {
      final authResult = await DynamicSdk.connect();
      
      if (authResult.isConnected) {
        _isConnected = true;
        _address = authResult.address;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error connecting wallet: $e');
      rethrow;
    }
  }

  Future<void> disconnectWallet() async {
    try {
      await DynamicSdk.disconnect();
      _isConnected = false;
      _address = '';
      notifyListeners();
    } catch (e) {
      debugPrint('Error disconnecting wallet: $e');
      rethrow;
    }
  }

  Future<String> signMessage(String message) async {
    try {
      final signature = await DynamicSdk.signMessage(message);
      return signature;
    } catch (e) {
      debugPrint('Error signing message: $e');
      rethrow;
    }
  }

  Future<String> sendTransaction({
    required String to,
    required BigInt value,
    required BigInt gasPrice,
    required BigInt gasLimit,
    String? data,
  }) async {
    try {
      final transaction = Transaction(
        to: EthereumAddress.fromHex(to),
        value: EtherAmount.fromBigInt(EtherUnit.wei, value),
        gasPrice: EtherAmount.fromBigInt(EtherUnit.wei, gasPrice),
        maxGas: gasLimit.toInt(),
        data: data != null ? hexToBytes(data) : null,
      );

      final txHash = await DynamicSdk.sendTransaction(transaction);
      return txHash;
    } catch (e) {
      debugPrint('Error sending transaction: $e');
      rethrow;
    }
  }
} 